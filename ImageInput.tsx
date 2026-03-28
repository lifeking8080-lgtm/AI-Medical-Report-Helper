import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "../components/ui/button";

interface ImageInputProps {
  onImageCapture: (imageData: string, file: File) => void;
  language: Language;
  translations: any;
}

import { Language } from "../utils/translations";

export function ImageInput({ onImageCapture, language, translations }: ImageInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onImageCapture(result, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
            setPreviewUrl(imageData);
            onImageCapture(imageData, file);
          }
        }, "image/jpeg");
      }
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  return (
    <div className="space-y-4">
      {showCamera ? (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={capturePhoto}
              className="flex-1 h-14 text-base bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="w-5 h-5 mr-2" />
              Capture
            </Button>
            <Button
              onClick={stopCamera}
              variant="outline"
              className="flex-1 h-14 text-base border-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {previewUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-[3/4]">
                <img
                  src={previewUrl}
                  alt="Captured report"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={startCamera}
                  variant="outline"
                  className="flex-1 h-14 text-base border-2"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {translations[language].scanCamera}
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1 h-14 text-base border-2"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {translations[language].uploadReport}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-100 aspect-[3/4] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
                    <Camera className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">No image selected</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={startCamera}
                  className="flex-1 h-14 text-base bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {translations[language].scanCamera}
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1 h-14 text-base border-2"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {translations[language].uploadReport}
                </Button>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}