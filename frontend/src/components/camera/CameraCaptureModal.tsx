import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCamera } from "../../hooks/useCamera";
import Button from "../ui/Button";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File, dataUrl: string) => void;
  title?: string;
  onCameraOpened?: () => void;
  onPhotoCaptured?: () => void;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Take a Photo",
  onCameraOpened,
  onPhotoCaptured,
}: CameraCaptureModalProps) {
  const {
    videoRef,
    isCameraActive,
    cameraError,
    capturedPhoto,
    startCamera,
    stopCamera,
    takePhoto,
    retakePhoto,
  } = useCamera();

  useEffect(() => {
    if (isOpen) {
      startCamera();
      if (onCameraOpened) onCameraOpened();
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera, onCameraOpened]);

  function handleClose() {
    stopCamera();
    onClose();
  }

  function handleTakePhoto() {
    takePhoto();
    if (onPhotoCaptured) onPhotoCaptured();
  }

  function handleConfirm() {
    if (capturedPhoto) {
      onConfirm(capturedPhoto.file, capturedPhoto.dataUrl);
      handleClose();
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-panel p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-line/60">
            <h3 className="font-display text-xl text-cream">{title}</h3>
            <button
              onClick={handleClose}
              className="rounded-full p-1.5 text-cream-dim transition-colors hover:bg-panel-soft hover:text-cream"
              aria-label="Close Modal"
            >
              ✕
            </button>
          </div>

          {/* Camera Stream / Preview Box */}
          <div className="mt-5 relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line/60 bg-ink flex items-center justify-center">
            {cameraError ? (
              <div className="p-6 text-center text-clay space-y-3">
                <span className="text-3xl">📷</span>
                <p className="text-sm font-medium">{cameraError}</p>
                <Button variant="outline" onClick={() => startCamera()}>
                  Try Again
                </Button>
              </div>
            ) : capturedPhoto ? (
              <img
                src={capturedPhoto.dataUrl}
                alt="Captured Snapshot"
                className="h-full w-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line/60">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>

            {capturedPhoto ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={retakePhoto}>
                  Retake Photo
                </Button>
                <Button onClick={handleConfirm}>
                  Use Photo
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleTakePhoto}
                disabled={!isCameraActive || Boolean(cameraError)}
              >
                📸 Capture Photo
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
