import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthScene3D from "../components/three/AuthScene3D";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import ThemeToggle from "../components/ui/ThemeToggle";
import { FieldWrapper, Input } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";
import { useSiteSettings } from "../hooks/useSiteSettings";
import officialLogo from "../assets/branding/brothers-photography-logo.jpg";

export default function Login() {
  const { login } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from || "/my-bookings";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const user = await login(phoneNumber, password);
      if (user.is_owner) {
        navigate("/admin", { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-16 transition-colors">
      <AuthScene3D />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/90 via-ink/95 to-ink" />

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
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
              <p className="text-xs uppercase tracking-[0.25em] text-gold/90 mt-0.5">Studio Login</p>
            </div>
          </Link>
        </div>

        <GlassCard>
          <h1 className="font-display text-2xl text-cream">Welcome Back</h1>
          <p className="mt-1 text-sm text-cream-dim">Log in to manage your shoots and bookings.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <FieldWrapper label="Phone Number">
              <Input
                required
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 90000 00000"
              />
            </FieldWrapper>
            <FieldWrapper label="Password">
              <Input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
            </FieldWrapper>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-gold hover:text-gold-soft">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-sm text-clay">{error}</p>}

            <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full justify-center">
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-cream-dim">
            New here?{" "}
            <Link to="/register" className="text-gold hover:text-gold-soft font-medium">
              Create an account
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-cream-dim/70">
            Studio owner?{" "}
            <Link to="/owner-login" className="text-gold/80 hover:text-gold-soft">
              Log in here
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
