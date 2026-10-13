import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CinematicAuthLayout from "../components/auth/CinematicAuthLayout";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = (location.state as { from?: string } | null)?.from || "/dashboard";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(""); setIsSubmitting(true);
    try {
      const user = await login(identifier.trim(), password);
      navigate(user.is_owner ? "/admin" : redirectTo, { replace: true });
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setIsSubmitting(false); }
  }

  return <CinematicAuthLayout page="login" activeTab="login" showTabs>
    <p className="cin-eyebrow">Private client portal</p>
    <h2 className="cin-form-heading">Welcome Back</h2>
    <p className="cin-form-subtitle">Let’s continue your photography journey.</p>
    <form onSubmit={handleSubmit} className="cin-auth-form">
      <label className="cin-input-wrap"><span className="cin-input-icon">✉</span><input className="cin-input" required autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Email address / phone number" aria-label="Email address or phone number" /></label>
      <label className="cin-input-wrap"><span className="cin-input-icon">♙</span><input className="cin-input" required autoComplete="current-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" aria-label="Password" /><button className="cin-password-toggle" type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "◉"}</button></label>
      <div className="cin-form-row"><label className="cin-remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />Remember me</label><Link className="cin-text-link" to="/forgot-password">Forgot password?</Link></div>
      {error && <p role="alert" className="cin-form-error">{error}</p>}
      <button className="cin-primary-btn" type="submit" disabled={isSubmitting}><span>{isSubmitting ? "Signing in…" : "Login"}</span><span className="cin-btn-arrow">→</span></button>
      <div className="cin-divider">OR CONTINUE WITH</div>
      <button className="cin-social-btn" type="button" onClick={() => setError("Google sign-in is not connected yet. Configure Google OAuth in the backend first.")}><span className="cin-google-mark">G</span>Continue with Google</button>
      <button className="cin-social-btn" type="button" onClick={() => setError("Apple sign-in is not configured for this website yet.")}><span className="cin-apple-mark">●</span>Continue with Apple</button>
      <p className="cin-form-footnote">Don’t have an account? <Link className="cin-text-link" to="/register">Create one</Link></p>
      <p className="cin-form-footnote">Studio owner? <Link className="cin-text-link" to="/owner-login">Owner login</Link></p>
    </form>
  </CinematicAuthLayout>;
}
