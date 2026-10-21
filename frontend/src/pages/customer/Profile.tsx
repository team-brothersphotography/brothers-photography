import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import GlassCard from "../../components/ui/GlassCard";
import CameraCaptureModal from "../../components/camera/CameraCaptureModal";
import { FieldWrapper, Input } from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";
import { changePassword } from "../../api/auth";
import { extractErrorMessage } from "../../api/client";
import { trackActivity } from "../../services/activityTracker";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  useEffect(() => {
    trackActivity("PROFILE_VIEWED", "/profile");
  }, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (newPassword.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }

    setIsChangingPwd(true);
    try {
      const res = await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });
      setPwdSuccess(res.detail || "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      trackActivity("PROFILE_UPDATED", "/profile", { updated: "password" });
    } catch (err) {
      setPwdError(extractErrorMessage(err));
    } finally {
      setIsChangingPwd(false);
    }
  }

  function handleCameraConfirm(file: File, dataUrl: string) {
    setAvatarPreview(dataUrl);
    trackActivity("PHOTO_UPLOADED", "/profile", { filename: file.name, size: file.size });
  }

  async function handleLogout() {
    trackActivity("LOGOUT", "/profile");
    await logout();
    navigate("/");
  }

  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm uppercase tracking-[0.2em] text-gold">My Account</p>
          <h1 className="mt-2 font-display text-4xl text-cream">Customer Profile</h1>
        </motion.div>

        <div className="mt-10 grid gap-8 md:grid-cols-12">
          {/* Account Card */}
          <div className="md:col-span-5 space-y-6">
            <div className="rounded-2xl border border-line bg-panel p-6 space-y-5">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="relative group">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Captured Avatar"
                      className="h-24 w-24 rounded-full object-cover border-2 border-gold shadow-lg"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gold/20 font-display text-4xl text-gold border-2 border-gold/40">
                      {user?.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="mt-3 text-xs font-medium text-gold hover:text-gold-soft flex items-center gap-1 justify-center mx-auto border border-gold/40 rounded-full px-3 py-1 bg-panel-soft transition-colors"
                  >
                    📷 Take Profile Photo
                  </button>
                </div>

                <div>
                  <p className="font-display text-xl text-cream">{user?.full_name}</p>
                  <p className="text-xs text-gold font-medium">
                    {user?.is_owner ? "Studio Owner" : "Registered Customer"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-line/60 text-sm">
                <div>
                  <span className="text-xs uppercase tracking-wider text-cream-dim/70">Phone Number</span>
                  <p className="text-cream font-medium">{user?.phone_number || "—"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-cream-dim/70">Email Address</span>
                  <p className="text-cream font-medium">{user?.email || "—"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-cream-dim/70">User ID</span>
                  <p className="text-cream-dim text-xs"># {user?.id}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-line/60">
                <Button variant="outline" onClick={handleLogout} className="w-full justify-center">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="md:col-span-7">
            <GlassCard>
              <h2 className="font-display text-2xl text-cream">Change Password</h2>
              <p className="mt-1 text-sm text-cream-dim">
                Update your account password securely.
              </p>

              <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
                <FieldWrapper label="Current Password">
                  <Input
                    required
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </FieldWrapper>

                <FieldWrapper label="New Password" hint="Min. 8 characters">
                  <Input
                    required
                    type="password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </FieldWrapper>

                <FieldWrapper label="Confirm New Password">
                  <Input
                    required
                    type="password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </FieldWrapper>

                {pwdError && <p className="text-sm text-clay">{pwdError}</p>}
                {pwdSuccess && <p className="text-sm text-moss font-medium">{pwdSuccess}</p>}

                <Button type="submit" isLoading={isChangingPwd} className="mt-2 w-full justify-center">
                  Update Password
                </Button>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Real WebRTC Browser Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onConfirm={handleCameraConfirm}
        title="Capture Profile Photo"
        onCameraOpened={() => trackActivity("CAMERA_OPENED", "/profile")}
        onPhotoCaptured={() => trackActivity("PHOTO_CAPTURED", "/profile")}
      />
    </Layout>
  );
}
