import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthScene3D from "../components/three/AuthScene3D";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import { FieldWrapper, Input } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";
import { useSiteSettings } from "../hooks/useSiteSettings";
import officialLogo from "../assets/branding/brothers-photography-logo.jpg";

export default function Register() {
  const { register } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        full_name: fullName,
        phone_number: phoneNumber,
        password,
        confirm_password: confirmPassword,
      });
      navigate("/dashboard", { replace: true });
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
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
              <p className="mt-0.5 text-xs uppercase tracking-[0.25em] text-gold/90">Create Account</p>
            </div>
          </Link>
        </div>

        <GlassCard>
          <p className="font-display text-2xl text-cream">Create your account</p>
          <p className="mt-1 text-sm text-cream-dim">
            Register to book a shoot and track your bookings.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <FieldWrapper label="Full Name">
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
            </FieldWrapper>
            <FieldWrapper label="Phone Number">
              <Input
                required
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 90000 00000"
              />
            </FieldWrapper>
            <FieldWrapper label="Password" hint="Minimum 8 characters">
              <Input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </FieldWrapper>
            <FieldWrapper label="Confirm Password">
              <Input
                required
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
            </FieldWrapper>

            {error && <p className="text-sm text-clay">{error}</p>}

            <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-cream-dim">
            Already have an account?{" "}
            <Link to="/login" className="text-gold hover:text-gold-soft">
              Log in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
