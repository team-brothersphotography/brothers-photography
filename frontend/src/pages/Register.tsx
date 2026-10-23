
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import CinematicAuthLayout from "../components/auth/CinematicAuthLayout";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";
import { SECURITY_QUESTIONS } from "../api/auth";

export default function Register() {
  const { register, signInWithGoogle, completeGoogleSignUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([
    "",
    "",
    "",
  ]);
  const [answers, setAnswers] = useState(["", "", ""]);

  const [googleCredential, setGoogleCredential] = useState("");
  const [googleFullName, setGoogleFullName] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [showGooglePhone, setShowGooglePhone] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateQuestion(index: number, key: string) {
    setSelectedQuestions((current) =>
      current.map((value, i) => (i === index ? key : value))
    );
  }

  function updateAnswer(index: number, value: string) {
    setAnswers((current) =>
      current.map((answer, i) => (i === index ? value : answer))
    );
  }

  async function handleSubmit(e: FormEvent) {
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

    if (
      selectedQuestions.some((key) => !key) ||
      new Set(selectedQuestions).size !== 3
    ) {
      setError("Please choose three different security questions.");
      return;
    }

    if (answers.some((answer) => !answer.trim())) {
      setError("Please answer all three security questions.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        password,
        confirm_password: confirmPassword,
        security_answers: selectedQuestions.map((question_key, index) => ({
          question_key: question_key as (typeof SECURITY_QUESTIONS)[number]["key"],
          answer: answers[index].trim().toLowerCase().replace(/\s+/g, " "),
        })),
      });

      navigate("/dashboard", { replace: true });
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
        setPhoneNumber("");
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

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      await completeGoogleSignUp(googleCredential, phoneNumber.trim());
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
    setGoogleEmail("");
    setGoogleFullName("");
    setPhoneNumber("");
    setError("");
  }

  return (
    <CinematicAuthLayout page="register" activeTab="register" showTabs>
      <p className="cin-eyebrow">Your story starts here</p>

      <h2 className="cin-form-heading">
        {showGooglePhone ? "Complete Your Account" : "Create Account"}
      </h2>

      <p className="cin-form-subtitle">
        {showGooglePhone
          ? "One last step before you begin."
          : "Make a space for your unforgettable moments."}
      </p>

      {showGooglePhone ? (
        <form
          onSubmit={handleGooglePhoneSubmit}
          className="cin-auth-form"
        >
          <p className="cin-form-subtitle">
            Signed in with Google as <strong>{googleFullName}</strong>
            {googleEmail ? (
              <>
                <br />
                {googleEmail}
              </>
            ) : null}
          </p>

          <label className="cin-input-wrap">
            <span className="cin-input-icon">☎</span>
            <input
              className="cin-input"
              required
              autoComplete="tel"
              type="tel"
              minLength={7}
              maxLength={20}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number (Indian mobile)"
              aria-label="Phone number"
            />
          </label>

          <p className="cin-form-subtitle">
            We’ll check whether this number is already registered. This step
            does not verify ownership of the phone number.
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
            Back to registration
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="cin-auth-form">
          <label className="cin-input-wrap">
            <span className="cin-input-icon">♙</span>
            <input
              className="cin-input"
              required
              autoComplete="name"
              minLength={2}
              maxLength={150}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              aria-label="Full name"
            />
          </label>

          <label className="cin-input-wrap">
            <span className="cin-input-icon">☎</span>
            <input
              className="cin-input"
              required
              autoComplete="tel"
              type="tel"
              minLength={7}
              maxLength={20}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number (with country code)"
              aria-label="Phone number"
            />
          </label>

          <label className="cin-input-wrap">
            <span className="cin-input-icon">♙</span>
            <input
              className="cin-input"
              required
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
              aria-label="Create password"
            />
            <button
              className="cin-password-toggle"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? "Hide" : "◉"}
            </button>
          </label>

          <label className="cin-input-wrap">
            <span className="cin-input-icon">♙</span>
            <input
              className="cin-input"
              required
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              aria-label="Confirm password"
            />
            <button
              className="cin-password-toggle"
              type="button"
              onClick={() => setShowConfirm((value) => !value)}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirm ? "Hide" : "◉"}
            </button>
          </label>

          <div className="cin-divider">ACCOUNT RECOVERY</div>

          <p className="cin-form-subtitle">
            Choose three security questions. Remember your answers—you will
            need them if you forget your password.
          </p>

          {selectedQuestions.map((selectedKey, index) => (
            <div key={index} className="cin-security-question">
              <label className="cin-input-wrap">
                <span className="cin-input-icon">{index + 1}.</span>
                <select
                  className="cin-input"
                  required
                  value={selectedKey}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  aria-label={`Security question ${index + 1}`}
                >
                  <option value="">
                    Choose security question {index + 1}
                  </option>
                  {SECURITY_QUESTIONS.filter(
                    (question) =>
                      question.key === selectedKey ||
                      !selectedQuestions.includes(question.key)
                  ).map((question) => (
                    <option key={question.key} value={question.key}>
                      {question.text}
                    </option>
                  ))}
                </select>
              </label>

              <label className="cin-input-wrap">
                <span className="cin-input-icon">✎</span>
                <input
                  className="cin-input"
                  required
                  maxLength={200}
                  autoComplete="off"
                  value={answers[index]}
                  onChange={(e) => updateAnswer(index, e.target.value)}
                  placeholder={`Answer ${index + 1}`}
                  aria-label={`Answer to security question ${index + 1}`}
                />
              </label>
            </div>
          ))}

          <p className="cin-form-subtitle">
            Answers are matched without case sensitivity. Choose answers you
            can remember but others cannot easily guess.
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
              {isSubmitting ? "Creating account…" : "Create account"}
            </span>
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
            Already have an account?{" "}
            <Link className="cin-text-link" to="/login">
              Log in
            </Link>
          </p>
        </form>
      )}
    </CinematicAuthLayout>
  );
}
