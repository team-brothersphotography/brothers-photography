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

export default function OwnerLogin() {
  const { login, logout } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      if (!user.is_owner) {
        await logout();
        setError("This account isn't set up as a studio owner/admin.");
        return;
      }
      navigate("/admin", { replace: true });
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
              <p className="mt-0.5 text-xs uppercase tracking-[0.3em] text-gold/90">Owner Access</p>
            </div>
          </Link>
        </div>

        <GlassCard>
          <p className="font-display text-2xl text-cream">Studio owner login</p>
          <p className="mt-1 text-sm text-cream-dim">
            Manage bookings, gallery and services from your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <FieldWrapper label="Email">
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@brothersphotography.com"
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

            <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-cream-dim/70">
            Not the owner?{" "}
            <Link to="/login" className="text-gold hover:text-gold-soft">
              Customer login
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
