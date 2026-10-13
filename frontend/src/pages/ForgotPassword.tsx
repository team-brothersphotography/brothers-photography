import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import CinematicAuthLayout from "../components/auth/CinematicAuthLayout";
import { extractErrorMessage } from "../api/client";
import { requestPasswordResetOtp, verifyPasswordResetOtp, resetPasswordWithToken } from "../api/auth";

type Step = "phone" | "otp" | "reset" | "done";
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("phone"); const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(""); const [devOtp, setDevOtp] = useState<string | null>(null); const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault(); setError(""); setIsSubmitting(true);
    try { const res = await requestPasswordResetOtp(phoneNumber.trim()); setDevOtp(res.dev_otp ?? null); setStep("otp"); }
    catch (err) { setError(extractErrorMessage(err)); }
    finally { setIsSubmitting(false); }
  }
  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault(); setError(""); setIsSubmitting(true);
    try { const res = await verifyPasswordResetOtp(phoneNumber.trim(), otp); setResetToken(res.reset_token); setStep("reset"); }
    catch (err) { setError(extractErrorMessage(err)); }
    finally { setIsSubmitting(false); }
  }
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault(); setError("");
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setIsSubmitting(true);
    try { await resetPasswordWithToken({ reset_token: resetToken, new_password: newPassword, confirm_password: confirmPassword }); setStep("done"); }
    catch (err) { setError(extractErrorMessage(err)); }
    finally { setIsSubmitting(false); }
  }

  return <CinematicAuthLayout page="forgot">
    {step === "phone" && <><p className="cin-eyebrow">Account recovery</p><h2 className="cin-form-heading">Forgot password?</h2><p className="cin-form-subtitle">Enter the mobile number linked to your account to request a one-time code.</p><form className="cin-auth-form" onSubmit={handleRequestOtp}>
      <label className="cin-input-wrap"><span className="cin-input-icon">☎</span><input className="cin-input" required type="tel" autoComplete="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone number with country code" aria-label="Phone number" /></label>
      {error && <p role="alert" className="cin-form-error">{error}</p>}<button className="cin-primary-btn" type="submit" disabled={isSubmitting}><span>{isSubmitting ? "Requesting code…" : "Send OTP"}</span><span className="cin-btn-arrow">→</span></button><p className="cin-form-footnote"><Link className="cin-text-link" to="/login">← Back to login</Link></p>
    </form></>}
    {step === "otp" && <><p className="cin-eyebrow">Secure verification</p><h2 className="cin-form-heading">Enter the OTP</h2><p className="cin-form-subtitle">Enter the six-digit code for {phoneNumber}.</p>{devOtp && <p className="cin-form-notice">Development mode: no SMS provider is configured, so the test code is <strong>{devOtp}</strong>. This is not an SMS delivery confirmation.</p>}<form className="cin-auth-form" onSubmit={handleVerifyOtp}>
      <label className="cin-input-wrap"><span className="cin-input-icon">#</span><input className="cin-input" required inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit OTP" aria-label="Six digit OTP" /></label>
      {error && <p role="alert" className="cin-form-error">{error}</p>}<button className="cin-primary-btn" type="submit" disabled={isSubmitting}><span>{isSubmitting ? "Verifying…" : "Verify OTP"}</span><span className="cin-btn-arrow">→</span></button><button type="button" className="cin-social-btn" onClick={() => { setStep("phone"); setOtp(""); setError(""); }}>Use a different number</button>
    </form></>}
    {step === "reset" && <><p className="cin-eyebrow">Almost there</p><h2 className="cin-form-heading">Set a new password</h2><p className="cin-form-subtitle">Choose a strong password with at least eight characters.</p><form className="cin-auth-form" onSubmit={handleResetPassword}>
      <label className="cin-input-wrap"><span className="cin-input-icon">♙</span><input className="cin-input" required minLength={8} maxLength={72} type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" aria-label="New password" /></label>
      <label className="cin-input-wrap"><span className="cin-input-icon">♙</span><input className="cin-input" required minLength={8} maxLength={72} type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" aria-label="Confirm new password" /></label>
      {error && <p role="alert" className="cin-form-error">{error}</p>}<button className="cin-primary-btn" type="submit" disabled={isSubmitting}><span>{isSubmitting ? "Updating…" : "Reset password"}</span><span className="cin-btn-arrow">→</span></button>
    </form></>}
    {step === "done" && <><p className="cin-eyebrow">Recovery complete</p><h2 className="cin-form-heading">Password reset!</h2><p className="cin-form-subtitle">Your password has been updated. You can now log in securely.</p><button className="cin-primary-btn" type="button" onClick={() => navigate("/login", { replace: true })}><span>Return to login</span><span className="cin-btn-arrow">→</span></button></>}
  </CinematicAuthLayout>;
}
