import { useState } from "react";
import AdminLayout from "./AdminLayout";
import Button from "../../components/ui/Button";
import { FieldWrapper, Input } from "../../components/ui/Field";
import { changePassword } from "../../api/auth";
import { extractErrorMessage } from "../../api/client";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      setSuccess("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-md rounded-xl border border-line bg-panel p-6">
        <p className="font-display text-xl text-cream">Change your password</p>
        <p className="mt-1 text-sm text-cream-dim">
          Your owner password is never hard-coded anywhere in the app - set your own here and
          change it any time.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <FieldWrapper label="Current password">
            <Input
              required
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper label="New password" hint="Minimum 8 characters">
            <Input
              required
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper label="Confirm new password">
            <Input
              required
              type="password"
              minLength={8}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </FieldWrapper>

          {error && <p className="text-sm text-clay">{error}</p>}
          {success && <p className="text-sm text-gold">{success}</p>}

          <Button type="submit" isLoading={isSubmitting}>
            Update password
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
