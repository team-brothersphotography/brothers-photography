import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import CinematicAuthLayout from "../components/auth/CinematicAuthLayout";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

export default function OwnerLogin() {
  const { login, logout } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); const [error, setError] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(""); setIsSubmitting(true);
    try { const user = await login(email.trim(), password); if (!user.is_owner) { await logout(); setError("This account does not have studio owner access."); return; } navigate("/admin", { replace: true }); }
    catch (err) { setError(extractErrorMessage(err)); }
    finally { setIsSubmitting(false); }
  }
  return <CinematicAuthLayout page="owner">
    <p className="cin-eyebrow">Restricted studio access</p><h2 className="cin-form-heading">Owner Login</h2><p className="cin-form-subtitle">Manage bookings, gallery and services securely.</p>
    <form onSubmit={handleSubmit} className="cin-auth-form">
      <label className="cin-input-wrap"><span className="cin-input-icon">✉</span><input className="cin-input" required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="Owner email address" aria-label="Owner email address" /></label>
      <label className="cin-input-wrap"><span className="cin-input-icon">♙</span><input className="cin-input" required autoComplete="current-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" aria-label="Password" /><button className="cin-password-toggle" type="button" onClick={() => setShowPassword(v => !v)}>{showPassword ? "Hide" : "◉"}</button></label>
      <div className="cin-form-row"><span>Owner account only</span><Link className="cin-text-link" to="/forgot-password">Forgot password?</Link></div>
      {error && <p role="alert" className="cin-form-error">{error}</p>}
      <button className="cin-primary-btn" type="submit" disabled={isSubmitting}><span>{isSubmitting ? "Signing in…" : "Access dashboard"}</span><span className="cin-btn-arrow">→</span></button>
      <p className="cin-form-footnote">Not the owner? <Link className="cin-text-link" to="/login">Customer login</Link></p>
    </form>
  </CinematicAuthLayout>;
}
