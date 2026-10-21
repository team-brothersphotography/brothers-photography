import { useState, useRef, useCallback, useEffect } from "react";

export interface CapturedPhoto {
  dataUrl: string;
  file: File;
}

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraActive: boolean;
  isPermissionGranted: boolean;
  cameraError: string | null;
  capturedPhoto: CapturedPhoto | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  takePhoto: () => void;
  retakePhoto: () => void;
  clearCapturedPhoto: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCapturedPhoto(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera access is not supported by your browser.");
      return;
    }

    try {
      stopCamera(); // Ensure any prior stream is closed first
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = mediaStream;
      setIsCameraActive(true);
      setIsPermissionGranted(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {
          // Play interrupted or handled gracefully
        });
      }
    } catch (err: unknown) {
      setIsCameraActive(false);
      setIsPermissionGranted(false);
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError("Camera permission denied. Please allow access in browser settings.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setCameraError("No camera device detected on your system.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setCameraError("Camera is currently in use by another application.");
        } else {
          setCameraError(`Camera error: ${err.message}`);
        }
      } else {
        setCameraError("Failed to access camera. Please check your system settings.");
      }
    }
  }, [stopCamera]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const timestamp = new Date().getTime();
          const file = new File([blob], `camera_capture_${timestamp}.jpg`, { type: "image/jpeg" });
          setCapturedPhoto({ dataUrl, file });
          stopCamera(); // Stop stream after photo capture
        }
      },
      "image/jpeg",
      0.9
    );
  }, [isCameraActive, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    startCamera();
  }, [startCamera]);

  const clearCapturedPhoto = useCallback(() => {
    setCapturedPhoto(null);
  }, []);

  // Ensure camera streams are stopped on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isCameraActive,
    isPermissionGranted,
    cameraError,
    capturedPhoto,
    startCamera,
    stopCamera,
    takePhoto,
    retakePhoto,
    clearCapturedPhoto,
  };
}
