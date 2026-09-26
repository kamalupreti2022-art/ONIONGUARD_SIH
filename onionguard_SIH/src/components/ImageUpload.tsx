import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Trash2, 
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Video,
  X
} from 'lucide-react';
import { BatchData, Language } from '../types';
import { translations } from '../utils/translations';

interface ImageUploadProps {
  batch: BatchData;
  onAnalyze: (images: string[]) => void;
  onBack: () => void;
  language: Language;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  batch,
  onAnalyze,
  onBack,
  language,
}) => {
  const t = translations[language] || translations.en;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera tracks cleanly
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraLoading(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Compress/resize uploaded or captured image using canvas for smooth memory handling
  const processImageFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const isImage = validTypes.includes(file.type.toLowerCase()) || file.type.startsWith('image/');

    if (!isImage) {
      setErrorMessage(t.errorInvalidImage);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.90);
          setSelectedImage(compressedDataUrl);
          setErrorMessage(null);
          stopCameraStream();
        }
      };
      img.onerror = () => {
        setErrorMessage(t.errorInvalidImage);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMessage(t.errorInvalidImage);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Start device camera / webcam
  const startCamera = async () => {
    setErrorMessage(null);
    setCameraLoading(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(t.cameraNotSupported);
      setCameraLoading(false);
      return;
    }

    try {
      stopCameraStream();
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraOpen(true);
      setCameraLoading(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.warn('Video play error:', err);
        });
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      stopCameraStream();
      setErrorMessage(t.cameraPermissionDenied);
    }
  };

  // Capture frame from active camera video
  const captureFromCamera = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
        setSelectedImage(dataUrl);
        setErrorMessage(null);
      }
    } catch (err) {
      console.error('Error capturing image from camera:', err);
      setErrorMessage('Failed to capture frame from camera.');
    } finally {
      stopCameraStream();
    }
  };

  const handleProceed = () => {
    if (!selectedImage) {
      setErrorMessage(t.errorNoImages);
      return;
    }
    onAnalyze([selectedImage]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top back button and Batch indicator */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1c2a20] bg-white px-3.5 py-2 rounded-xl border border-[#cfcbb8] hover:bg-[#f1f6f0] transition-colors cursor-pointer shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{batch.batchId ? `Batch: ${batch.batchId}` : 'Back'}</span>
        </button>

        <span className="text-xs font-bold text-[#55665b] font-heading">
          {t.stepIndicator}
        </span>
      </div>

      {/* Main Upload / Camera Container */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#174327] tracking-tight font-heading">
            {t.uploadTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#55665b] mt-1">
            {t.uploadSubtitle}
          </p>
        </div>

        {/* Error notice if camera denied or no image */}
        {errorMessage && (
          <div className="p-3.5 bg-[#fef2f2] border border-[#fca5a5] rounded-2xl text-[#b91c1c] text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef4444]" />
            <div className="flex-1">
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-[#ef4444] hover:text-[#b91c1c] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hidden File Input for Device Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/*"
          className="hidden"
        />

        {/* LIVE CAMERA VIEWFINDER (When Camera is Open) */}
        {isCameraOpen ? (
          <div className="rounded-2xl border-2 border-[#1c5a35] bg-[#0b2013] overflow-hidden p-4 space-y-4 shadow-md">
            <div className="flex items-center justify-between text-white text-xs font-bold font-heading">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span>{t.cameraActive}</span>
              </span>
              <button
                type="button"
                onClick={stopCameraStream}
                className="text-gray-300 hover:text-white inline-flex items-center gap-1 bg-[#122e1d] px-2.5 py-1 rounded-lg border border-[#24462f] cursor-pointer text-xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.stopCamera}</span>
              </button>
            </div>

            <div className="relative aspect-square sm:aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-[#174327]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onLoadedMetadata={(e) => {
                  (e.target as HTMLVideoElement).play().catch(() => {});
                }}
              />

              {/* Viewfinder Target Framing */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-white/40 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-12 h-12 border-t-2 border-l-2 border-[#f2c14e] absolute top-2 left-2" />
                <div className="w-12 h-12 border-t-2 border-r-2 border-[#f2c14e] absolute top-2 right-2" />
                <div className="w-12 h-12 border-b-2 border-l-2 border-[#f2c14e] absolute bottom-2 left-2" />
                <div className="w-12 h-12 border-b-2 border-r-2 border-[#f2c14e] absolute bottom-2 right-2" />
                <span className="text-[11px] font-mono text-white/80 bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-xs">
                  Center single onion bulb here
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={captureFromCamera}
                className="inline-flex items-center gap-2 bg-[#1c5a35] hover:bg-[#174327] text-white px-6 py-3 rounded-2xl font-extrabold text-sm transition shadow-md cursor-pointer active:scale-95"
              >
                <Camera className="w-5 h-5 text-[#f2c14e]" />
                <span>{t.capturePhoto}</span>
              </button>
            </div>
          </div>
        ) : selectedImage ? (
          /* PREVIEW OF SELECTED / CAPTURED IMAGE */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#174327] font-heading border-b border-[#e4e1d3] pb-2">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#10b981]" />
                <span>{t.previewTitle}</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="text-[#a93b2e] hover:text-[#c24535] inline-flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.clearImages}</span>
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-[#0b2013] aspect-square sm:aspect-video flex items-center justify-center border-2 border-[#1c5a35] shadow-xs">
              <img
                src={selectedImage}
                alt="Selected onion specimen"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-[#122e1d]/90 text-white text-xs font-mono px-3 py-1 rounded-lg font-bold shadow-xs">
                Ready for AI Model
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#f1f6f0] hover:bg-[#e0eee2] text-[#174327] px-3.5 py-2.5 rounded-xl border border-[#bcd6c0] transition cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Choose Another Image</span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#f1f6f0] hover:bg-[#e0eee2] text-[#174327] px-3.5 py-2.5 rounded-xl border border-[#bcd6c0] transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.retakePhoto}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleProceed}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1c5a35] hover:bg-[#174327] text-white px-8 py-3 rounded-xl font-extrabold text-sm transition shadow-md cursor-pointer active:scale-95"
              >
                <span>{t.analyzeButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* PRIMARY TWO-OPTION INPUT SELECTION: UPLOAD IMAGE OR USE CAMERA */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Upload Image */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${
                  dragOver
                    ? 'border-[#1c5a35] bg-[#e0eee2]'
                    : 'border-[#cfcbb8] hover:border-[#1c5a35] hover:bg-[#f1f6f0] bg-[#f8faf8]'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#e0eee2] border border-[#bcd6c0] flex items-center justify-center text-[#1c5a35] shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#174327] font-heading">
                    {t.uploadImageCTA}
                  </h3>
                  <p className="text-xs text-[#55665b] mt-1 max-w-xs">
                    {t.dragDropText}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#1c5a35] bg-white px-3 py-1 rounded-full border border-[#bcd6c0] shadow-2xs font-heading">
                  JPG, PNG, WebP
                </span>
              </div>

              {/* Option B: Take Picture / Use Camera */}
              <div
                onClick={startCamera}
                className="p-6 rounded-2xl border-2 border-[#bcd6c0] hover:border-[#1c5a35] bg-[#f8faf8] hover:bg-[#f1f6f0] transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 shadow-2xs"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#174327] border border-[#0b2013] flex items-center justify-center text-[#f2c14e] shadow-xs">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#174327] font-heading">
                    {t.takePictureCTA}
                  </h3>
                  <p className="text-xs text-[#55665b] mt-1 max-w-xs">
                    Opens device webcam or smartphone camera with live viewfinder.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#174327] bg-[#f2c14e] px-3 py-1 rounded-full shadow-2xs font-heading">
                  Live Viewfinder
                </span>
              </div>
            </div>

            {/* Simple instruction note */}
            <div className="bg-[#f7f5ee] border border-[#cfcbb8] rounded-2xl p-4 text-xs text-[#55665b] text-center">
              <p>
                Provide a clear, well-lit photograph of an onion. The AI model will evaluate all 8 classes and report combined <strong>HEALTHY</strong> vs <strong>UNHEALTHY</strong> quality.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
