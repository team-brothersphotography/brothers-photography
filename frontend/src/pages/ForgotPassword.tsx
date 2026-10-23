
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import CinematicAuthLayout from "../components/auth/CinematicAuthLayout";
import { extractErrorMessage } from "../api/client";
import {
  SECURITY_QUESTIONS,
  getPasswordRecoveryQuestions,
  verifyPasswordRecoveryAnswers,
  resetPasswordWithToken,
  type SecurityAnswer,
} from "../api/auth";

type Step = "phone" | "questions" | "reset" | "done";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [availableQuestions, setAvailableQuestions] = useState<
    { key: string; text: string }[]
  >([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFindAccount(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await getPasswordRecoveryQuestions(phoneNumber.trim());

      if (
        !result.recovery_available ||
        result.questions.length !== 3
      ) {
        setError(
          "Recovery questions are unavailable for this account. Please contact the studio for assistance."
        );
        return;
      }

      setAvailableQuestions(result.questions);
      setAnswers({});
      setStep("questions");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyAnswers(e: FormEvent) {
    e.preventDefault();
    setError("");

    const securityAnswers: SecurityAnswer[] = availableQuestions.map(
      (question) => ({
        question_key: question.key as SecurityAnswer["question_key"],
        answer: (answers[question.key] || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " "),
      })
    );

    if (securityAnswers.some((item) => !item.answer)) {
      setError("Please answer all three security questions.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await verifyPasswordRecoveryAnswers({
        phone_number: phoneNumber.trim(),
        security_answers: securityAnswers,
      });

      setResetToken(result.reset_token);
      setStep("reset");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
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
    <CinematicAuthLayout page="forgot">
      {step === "phone" && (
        <>
          <p className="cin-eyebrow">Account recovery</p>
          <h2 className="cin-form-heading">Forgot password?</h2>
          <p className="cin-form-subtitle">
            Enter your registered phone number to retrieve your recovery questions.
          </p>

          <form className="cin-auth-form" onSubmit={handleFindAccount}>
            <label className="cin-input-wrap">
              <span className="cin-input-icon">☎</span>
              <input
                className="cin-input"
                required
                type="tel"
                autoComplete="tel"
                minLength={7}
                maxLength={20}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number with country code"
                aria-label="Phone number"
              />
            </label>

            {error && <p role="alert" className="cin-form-error">{error}</p>}

            <button className="cin-primary-btn" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Checking…" : "Continue"}</span>
              <span className="cin-btn-arrow">→</span>
            </button>

            <p className="cin-form-footnote">
              <Link className="cin-text-link" to="/login">← Back to login</Link>
            </p>
          </form>
        </>
      )}

      {step === "questions" && (
        <>
          <p className="cin-eyebrow">Secure verification</p>
          <h2 className="cin-form-heading">Your security questions</h2>
          <p className="cin-form-subtitle">
            Enter the answers you chose when creating your account.
            Answers are not case-sensitive.
          </p>

          <form className="cin-auth-form" onSubmit={handleVerifyAnswers}>
            {availableQuestions.map((question, index) => (
              <label key={question.key} className="cin-security-question">
                <span className="cin-form-subtitle">
                  {index + 1}. {question.text}
                </span>
                <span className="cin-input-wrap">
                  <span className="cin-input-icon">✎</span>
                  <input
                    className="cin-input"
                    required
                    maxLength={200}
                    autoComplete="off"
                    value={answers[question.key] || ""}
                    onChange={(e) =>
                      setAnswers((current) => ({
                        ...current,
                        [question.key]: e.target.value,
                      }))
                    }
                    placeholder="Your answer"
                    aria-label={`Answer ${index + 1}`}
                  />
                </span>
              </label>
            ))}

            {error && <p role="alert" className="cin-form-error">{error}</p>}

            <button className="cin-primary-btn" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Verifying…" : "Verify answers"}</span>
              <span className="cin-btn-arrow">→</span>
            </button>

            <button
              type="button"
              className="cin-social-btn"
              onClick={() => {
                setStep("phone");
                setAnswers({});
                setError("");
              }}
            >
              Use a different number
            </button>
          </form>
        </>
      )}

      {step === "reset" && (
        <>
          <p className="cin-eyebrow">Almost there</p>
          <h2 className="cin-form-heading">Set a new password</h2>
          <p className="cin-form-subtitle">
            Choose a strong password with at least eight characters.
          </p>

          <form className="cin-auth-form" onSubmit={handleResetPassword}>
            <label className="cin-input-wrap">
              <span className="cin-input-icon">♙</span>
              <input
                className="cin-input"
                required
                minLength={8}
                maxLength={72}
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                aria-label="New password"
              />
            </label>

            <label className="cin-input-wrap">
              <span className="cin-input-icon">♙</span>
              <input
                className="cin-input"
                required
                minLength={8}
                maxLength={72}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                aria-label="Confirm new password"
              />
            </label>

            {error && <p role="alert" className="cin-form-error">{error}</p>}

            <button className="cin-primary-btn" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Updating…" : "Reset password"}</span>
              <span className="cin-btn-arrow">→</span>
            </button>
          </form>
        </>
      )}

      {step === "done" && (
        <>
          <p className="cin-eyebrow">Recovery complete</p>
          <h2 className="cin-form-heading">Password reset!</h2>
          <p className="cin-form-subtitle">
            Your password has been updated. You can now log in securely.
          </p>
          <button
            className="cin-primary-btn"
            type="button"
            onClick={() => navigate("/login", { replace: true })}
          >
            <span>Return to login</span>
            <span className="cin-btn-arrow">→</span>
          </button>
        </>
      )}
    </CinematicAuthLayout>
  );
}
