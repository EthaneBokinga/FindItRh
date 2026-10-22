import { Camera, Check, RefreshCw, SwitchCamera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function startCamera(mode: "environment" | "user") {
    setLoading(true);
    setError("");
    stopCamera();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("L'accès direct à la caméra n'est pas supporté par ce navigateur.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setLoading(false);
    } catch (err) {
      console.warn("Échec d'accès caméra directe :", err);
      setError("Accès caméra indisponible ou bloqué. Utilisez le sélecteur ci-dessous.");
      setLoading(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  useEffect(() => {
    startCamera(facingMode);
    return () => stopCamera();
  }, [facingMode]);

  function takePhoto() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
    setCapturedImage(dataUrl);
    stopCamera();
  }

  function switchCamera() {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }

  function retry() {
    setCapturedImage(null);
    startCamera(facingMode);
  }

  function confirmPhoto() {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  }

  function handleFallbackFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCapturedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="camera-overlay">
      <div className="camera-modal">
        <div className="camera-header">
          <div className="camera-title">
            <Camera size={20} />
            <strong>Appareil photo</strong>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">
            <X size={22} />
          </button>
        </div>

        <div className="camera-viewport">
          {!capturedImage ? (
            <>
              {loading && <div className="camera-loading">Ouverture de l'appareil…</div>}
              {error ? (
                <div className="camera-error">
                  <p>{error}</p>
                  <label className="btn btn-outline" style={{ cursor: "pointer", marginTop: "1rem" }}>
                    Choisir un fichier / Prendre une photo
                    <input type="file" accept="image/*" capture="environment" hidden onChange={handleFallbackFile} />
                  </label>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                  <div className="camera-frame-guide">
                    <span className="corner tl" />
                    <span className="corner tr" />
                    <span className="corner bl" />
                    <span className="corner br" />
                    <p className="camera-hint">Cadrez le lieu ou l'objet au centre</p>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="camera-preview-wrap">
              <img src={capturedImage} alt="Capture" className="camera-preview-img" />
            </div>
          )}
        </div>

        <div className="camera-controls">
          {!capturedImage ? (
            <div className="camera-shutter-row">
              <button
                type="button"
                className="icon-btn camera-switch-btn"
                onClick={switchCamera}
                title="Changer de caméra"
                disabled={Boolean(error) || loading}
              >
                <SwitchCamera size={24} />
              </button>

              <button
                type="button"
                className="camera-shutter-btn"
                onClick={takePhoto}
                disabled={Boolean(error) || loading}
                title="Déclencher la photo"
              >
                <div className="shutter-inner" />
              </button>

              <div style={{ width: 44 }} />
            </div>
          ) : (
            <div className="camera-actions-row">
              <button type="button" className="btn btn-outline" onClick={retry}>
                <RefreshCw size={16} /> Reprendre
              </button>
              <button type="button" className="btn" onClick={confirmPhoto}>
                <Check size={16} /> Valider la photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
