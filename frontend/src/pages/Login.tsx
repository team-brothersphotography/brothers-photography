
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import CinematicAuthLayout from "../components/auth/CinematicAuthLayout";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

export default function Login() {
  const {
    login,
    signInWithGoogle,
    completeGoogleSignUp,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showGooglePhone, setShowGooglePhone] = useState(false);
  const [googleCredential, setGoogleCredential] = useState("");
  const [googleFullName, setGoogleFullName] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googlePhone, setGooglePhone] = useState("");

  const redirectTo =
    (location.state as { from?: string } | null)?.from || "/dashboard";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login(identifier.trim(), password);
      navigate(user.is_owner ? "/admin" : redirectTo, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credential: string) {
    setError("");
    setIsSubmitting(true);

    try {
      const result = await signInWithGoogle(credential);

      if (result.needs_phone) {
        setGoogleCredential(credential);
        setGoogleFullName(result.full_name ?? "");
        setGoogleEmail(result.email ?? "");
        setGooglePhone("");
        setShowGooglePhone(true);
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGooglePhoneSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!googlePhone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      await completeGoogleSignUp(googleCredential, googlePhone.trim());
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function cancelGooglePhoneStep() {
    setShowGooglePhone(false);
    setGoogleCredential("");
    setGoogleFullName("");
    setGoogleEmail("");
    setGooglePhone("");
    setError("");
  }

  return (
    <CinematicAuthLayout page="login" activeTab="login" showTabs>
      <p className="cin-eyebrow">Private client portal</p>

      <h2 className="cin-form-heading">
        {showGooglePhone ? "Complete Your Account" : "Welcome Back"}
      </h2>

      <p className="cin-form-subtitle">
        {showGooglePhone
          ? "One last step before your photography journey begins."
          : "Let’s continue your photography journey."}
      </p>

      {showGooglePhone ? (
        <form
          onSubmit={handleGooglePhoneSubmit}
          className="cin-auth-form"
        >
          <p className="cin-form-subtitle">
            Google account: <strong>{googleFullName}</strong>
            {googleEmail && (
              <>
                <br />
                {googleEmail}
              </>
            )}
          </p>

          <label className="cin-input-wrap">
            <span className="cin-input-icon">☎</span>
            <input
              className="cin-input"
              required
              type="tel"
              autoComplete="tel"
              minLength={7}
              maxLength={20}
              value={googlePhone}
              onChange={(e) => setGooglePhone(e.target.value)}
              placeholder="Phone number (Indian mobile)"
              aria-label="Phone number"
            />
          </label>

          <p className="cin-form-subtitle">
            We’ll check whether this number is already registered. This does
            not verify phone ownership.
          </p>

          {error && (
            <p role="alert" className="cin-form-error">
              {error}
            </p>
          )}

          <button
            className="cin-primary-btn"
            type="submit"
            disabled={isSubmitting}
          >
            <span>
              {isSubmitting ? "Completing account…" : "Complete account"}
            </span>
            <span className="cin-btn-arrow">→</span>
          </button>

          <button
            className="cin-social-btn"
            type="button"
            disabled={isSubmitting}
            onClick={cancelGooglePhoneStep}
          >
            Back to login
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="cin-auth-form">
          <label className="cin-input-wrap">
            <span className="cin-input-icon">✉</span>
            <input
              className="cin-input"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email address / phone number"
              aria-label="Email address or phone number"
            />
          </label>

          <label className="cin-input-wrap">
            <span className="cin-input-icon">♙</span>
            <input
              className="cin-input"
              required
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              aria-label="Password"
            />
            <button
              className="cin-password-toggle"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "◉"}
            </button>
          </label>

          <div className="cin-form-row">
            <label className="cin-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>

            <Link className="cin-text-link" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          {error && (
            <p role="alert" className="cin-form-error">
              {error}
            </p>
          )}

          <button
            className="cin-primary-btn"
            type="submit"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? "Signing in…" : "Login"}</span>
            <span className="cin-btn-arrow">→</span>
          </button>

          <div className="cin-divider">OR CONTINUE WITH</div>

          <div className="cin-google-login">
            <GoogleLogin
              onSuccess={(response) => {
                if (!response.credential) {
                  setError("Google did not return a valid sign-in credential.");
                  return;
                }

                void handleGoogleSuccess(response.credential);
              }}
              onError={() => {
                setError("Google sign-in failed. Please try again.");
              }}
              text="continue_with"
              theme="filled_black"
              shape="rectangular"
              size="large"
              width="320"
            />
          </div>

          <p className="cin-form-footnote">
            Don’t have an account?{" "}
            <Link className="cin-text-link" to="/register">
              Create one
            </Link>
          </p>

          <p className="cin-form-footnote">
            Studio owner?{" "}
            <Link className="cin-text-link" to="/owner-login">
              Owner login
            </Link>
          </p>
        </form>
      )}
    </CinematicAuthLayout>
  );
}
