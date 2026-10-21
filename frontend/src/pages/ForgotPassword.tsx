import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthScene3D from "../components/three/AuthScene3D";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import { FieldWrapper, Input } from "../components/ui/Field";
import { extractErrorMessage } from "../api/client";
import { useSiteSettings } from "../hooks/useSiteSettings";
import officialLogo from "../assets/branding/brothers-photography-logo.jpg";
import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithToken,
} from "../api/auth";

type Step = "phone" | "otp" | "reset" | "done";

export default function ForgotPassword() {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await requestPasswordResetOtp(phoneNumber);
      setDevOtp(res.dev_otp ?? null);
      setStep("otp");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { reset_token } = await verifyPasswordResetOtp(phoneNumber, otp);
      setResetToken(reset_token);
      setStep("reset");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPasswordWithToken({
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setStep("done");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-16">
      <AuthScene3D />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink/95 to-ink" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link to="/" className="group flex flex-col items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold/50 rounded-xl p-1">
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-gold/60 p-0.5 bg-ink shadow-2xl transition-transform group-hover:scale-105">
              <img
                src={settings?.logo || officialLogo}
                alt="Brothers Photography"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div>
              <span className="font-display text-2xl text-cream block tracking-wide">
                Brothers <span className="italic text-gold">Photography</span>
              </span>
              <p className="mt-0.5 text-xs uppercase tracking-[0.25em] text-gold/90">Password Recovery</p>
            </div>
          </Link>
        </div>

        <GlassCard>
          <AnimatePresence mode="wait">
            {step === "phone" && (
              <motion.div key="phone" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <p className="font-display text-2xl text-cream">Forgot your password?</p>
                <p className="mt-1 text-sm text-cream-dim">
                  Enter the phone number on your account and we'll send a one-time code.
                </p>
                <form onSubmit={handleRequestOtp} className="mt-6 flex flex-col gap-4">
                  <FieldWrapper label="Phone Number">
                    <Input
                      required
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 90000 00000"
                    />
                  </FieldWrapper>
                  {error && <p className="text-sm text-clay">{error}</p>}
                  <Button type="submit" isLoading={isSubmitting} className="w-full">
                    Send OTP
                  </Button>
                </form>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <p className="font-display text-2xl text-cream">Enter the OTP</p>
                <p className="mt-1 text-sm text-cream-dim">
                  We sent a 6-digit code to {phoneNumber}. It expires shortly, so enter it soon.
                </p>
                {devOtp && (
                  <p className="mt-3 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold">
                    Development mode - no SMS provider is configured yet, so here's the code
                    directly: <span className="font-semibold tracking-widest">{devOtp}</span>
                  </p>
                )}
                <form onSubmit={handleVerifyOtp} className="mt-6 flex flex-col gap-4">
                  <FieldWrapper label="6-digit OTP">
                    <Input
                      required
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                    />
                  </FieldWrapper>
                  {error && <p className="text-sm text-clay">{error}</p>}
                  <Button type="submit" isLoading={isSubmitting} className="w-full">
                    Verify OTP
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-xs text-cream-dim hover:text-cream"
                  >
                    ← Use a different number
                  </button>
                </form>
              </motion.div>
            )}

            {step === "reset" && (
              <motion.div key="reset" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <p className="font-display text-2xl text-cream">Set a new password</p>
                <p className="mt-1 text-sm text-cream-dim">Minimum 8 characters.</p>
                <form onSubmit={handleResetPassword} className="mt-6 flex flex-col gap-4">
                  <FieldWrapper label="New Password">
                    <Input
                      required
                      type="password"
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Confirm Password">
                    <Input
                      required
                      type="password"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </FieldWrapper>
                  {error && <p className="text-sm text-clay">{error}</p>}
                  <Button type="submit" isLoading={isSubmitting} className="w-full">
                    Reset password
                  </Button>
                </form>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <p className="font-display text-2xl text-cream">Password reset!</p>
                <p className="mt-2 text-sm text-cream-dim">You can now log in with your new password.</p>
                <Button className="mt-6 w-full" onClick={() => navigate("/login")}>
                  Go to login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </div>
  );
}
