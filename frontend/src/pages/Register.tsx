import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import CinematicAuthLayout from "../components/auth/CinematicAuthLayout";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

export default function Register() {
  const { register } = useAuth(); const navigate = useNavigate();
  const [fullName, setFullName] = useState(""); const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setIsSubmitting(true);
    try { await register({ full_name: fullName.trim(), phone_number: phoneNumber.trim(), password, confirm_password: confirmPassword }); navigate("/dashboard", { replace: true }); }
    catch (err) { setError(extractErrorMessage(err)); }
    finally { setIsSubmitting(false); }
  }

  return <CinematicAuthLayout page="register" activeTab="register" showTabs>
    <p className="cin-eyebrow">Your story starts here</p>
    <h2 className="cin-form-heading">Create Account</h2>
    <p className="cin-form-subtitle">Make a space for your unforgettable moments.</p>
    <form onSubmit={handleSubmit} className="cin-auth-form">
      <label className="cin-input-wrap"><span className="cin-input-icon">♙</span><input className="cin-input" required autoComplete="name" minLength={2} maxLength={150} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" aria-label="Full name" /></label>
      <label className="cin-input-wrap"><span className="cin-input-icon">☎</span><input className="cin-input" required autoComplete="tel" type="tel" minLength={7} maxLength={20} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone number (with country code)" aria-label="Phone number" /></label>
      <label className="cin-input-wrap"><span className="cin-input-icon">♙</span><input className="cin-input" required autoComplete="new-password" minLength={8} maxLength={72} type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create password" aria-label="Create password" /><button className="cin-password-toggle" type="button" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility">{showPassword ? "Hide" : "◉"}</button></label>
      <label className="cin-input-wrap"><span className="cin-input-icon">♙</span><input className="cin-input" required autoComplete="new-password" minLength={8} maxLength={72} type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" aria-label="Confirm password" /><button className="cin-password-toggle" type="button" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm password visibility">{showConfirm ? "Hide" : "◉"}</button></label>
      {error && <p role="alert" className="cin-form-error">{error}</p>}
      <button className="cin-primary-btn" type="submit" disabled={isSubmitting}><span>{isSubmitting ? "Creating account…" : "Create account"}</span><span className="cin-btn-arrow">→</span></button>
      <div className="cin-divider">OR CONTINUE WITH</div>
      <button className="cin-social-btn" type="button" onClick={() => setError("Google sign-up is not connected yet. Configure Google OAuth in the backend first.")}><span className="cin-google-mark">G</span>Continue with Google</button>
      <button className="cin-social-btn" type="button" onClick={() => setError("Apple sign-in is not configured for this website yet.")}><span className="cin-apple-mark">●</span>Continue with Apple</button>
      <p className="cin-form-footnote">Already have an account? <Link className="cin-text-link" to="/login">Log in</Link></p>
    </form>
  </CinematicAuthLayout>;
}
