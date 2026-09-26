/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Trash2, 
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  Check,
  X,
  Phone,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { BatchData, Language } from '../types';
import { translations } from '../utils/translations';
import { validateIndianPhoneNumber } from '../utils/whatsappService';

interface ImageUploadProps {
  batch: BatchData;
  onAnalyze: (images: string[], farmerPhone?: string) => void;
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

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Farmer WhatsApp transparency input state
  const [farmerPhone, setFarmerPhone] = useState(batch.farmerPhone || '');
  const [phoneTouched, setPhoneTouched] = useState(false);

  // Live Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [capturedFlash, setCapturedFlash] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate phone
  const phoneValidation = validateIndianPhoneNumber(farmerPhone);
  const isPhoneValid = phoneValidation.isValid;

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
  const processImageFile = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const isImage = validTypes.includes(file.type.toLowerCase()) || file.type.startsWith('image/');

      if (!isImage) {
        resolve(null);
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
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
            resolve(compressedDataUrl);
          } else {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleMultipleFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files);
    if (validFiles.length === 0) return;

    setErrorMessage(null);
    const newImages: string[] = [];

    for (const file of validFiles) {
      const processed = await processImageFile(file);
      if (processed) {
        newImages.push(processed);
      }
    }

    if (newImages.length === 0) {
      setErrorMessage(t.errorInvalidImage || 'Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    setSelectedImages((prev) => [...prev, ...newImages]);
    stopCameraStream();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMultipleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Start device camera / webcam
  const startCamera = async () => {
    setErrorMessage(null);
    setCameraLoading(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(t.cameraNotSupported || 'Camera not supported on this device.');
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
      setErrorMessage(t.cameraPermissionDenied || 'Camera permission denied or camera unavailable.');
    }
  };

  // Capture frame from active camera video and append to batch
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setSelectedImages((prev) => [...prev, dataUrl]);
        setErrorMessage(null);

        // Visual flash feedback
        setCapturedFlash(true);
        setTimeout(() => setCapturedFlash(false), 200);
      }
    } catch (err) {
      console.error('Error capturing image from camera:', err);
      setErrorMessage('Failed to capture frame from camera.');
    }
  };

  const handleProceed = () => {
    setPhoneTouched(true);

    if (selectedImages.length === 0) {
      setErrorMessage('Please select or capture at least one onion photo.');
      return;
    }

    if (!isPhoneValid) {
      setErrorMessage("Please enter a valid 10-digit Indian WhatsApp number before starting analysis.");
      return;
    }

    setErrorMessage(null);
    onAnalyze(selectedImages, farmerPhone.trim());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
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
          {t.stepIndicator || 'Step 2 of 4'}
        </span>
      </div>

      {/* Main Upload / Camera Container */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#174327] tracking-tight font-heading">
            {t.uploadTitle || 'Upload Onion Photographs'}
          </h1>
          <p className="text-xs sm:text-sm text-[#55665b] mt-1">
            Select multiple onion photos at once from your device or capture consecutive photos with the camera.
          </p>
        </div>

        {/* Error notice */}
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

        {/* Hidden Multiple File Input for Device Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/*"
          multiple
          className="hidden"
        />

        {/* SECTION 1: FARMER WHATSAPP NUMBER INPUT (COLLECTED BEFORE ANALYSIS) */}
        <div className="bg-[#f7f5ee] border-2 border-[#d9d5c1] rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#174327] font-heading flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#1c5a35]" />
              <span>Farmer WhatsApp Number <span className="text-[#a93b2e]">*</span></span>
            </label>
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => { setFarmerPhone('9876543210'); setPhoneTouched(true); }}
                className="text-[10px] font-bold text-[#1c5a35] hover:text-[#174327] hover:underline cursor-pointer bg-white px-2 py-0.5 rounded border border-[#cfcbb8]"
              >
                Use Sample (98765 43210)
              </button>
              <span className="text-[10px] text-[#55665b] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#1c5a35]" />
                <span>Private & Encrypted</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center px-3 py-2.5 bg-white border border-[#cfcbb8] rounded-xl text-xs font-bold text-[#174327]">
              <span>🇮🇳 +91</span>
            </div>
            <input
              type="tel"
              value={farmerPhone}
              onChange={(e) => {
                setFarmerPhone(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              onBlur={() => setPhoneTouched(true)}
              placeholder="e.g. 98765 43210"
              maxLength={15}
              className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-mono font-bold transition focus:outline-none ${
                phoneTouched && !isPhoneValid
                  ? 'border-[#ef4444] bg-[#fef2f2] text-[#b91c1c]'
                  : isPhoneValid
                  ? 'border-[#10b981] bg-[#f0fdf4] text-[#1c5a35]'
                  : 'border-[#cfcbb8] bg-white text-[#1c2a20]'
              }`}
            />
          </div>

          <p className="text-[11px] text-[#55665b]">
            The automated tamper-evident quality report will be dispatched to the farmer upon analysis completion.
          </p>
        </div>

        {/* SECTION 2: LIVE CAMERA VIEWFINDER (When Camera is Open) */}
        {isCameraOpen ? (
          <div className="rounded-2xl border-2 border-[#1c5a35] bg-[#0b2013] overflow-hidden p-4 space-y-4 shadow-md">
            <div className="flex items-center justify-between text-white text-xs font-bold font-heading">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span>Camera Active — {selectedImages.length} photo{selectedImages.length === 1 ? '' : 's'} added</span>
              </span>
              <button
                type="button"
                onClick={stopCameraStream}
                className="text-gray-300 hover:text-white inline-flex items-center gap-1 bg-[#122e1d] px-2.5 py-1 rounded-lg border border-[#24462f] cursor-pointer text-xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Done with Camera</span>
              </button>
            </div>

            <div className={`relative aspect-square sm:aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-[#174327] transition-opacity ${
              capturedFlash ? 'opacity-30' : 'opacity-100'
            }`}>
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
                <span className="text-[11px] font-mono text-white/90 bg-black/60 px-3 py-1 rounded-md backdrop-blur-xs">
                  Center onion bulb & click Capture Photo
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={captureFromCamera}
                className="inline-flex items-center gap-2 bg-[#1c5a35] hover:bg-[#174327] text-white px-6 py-3 rounded-2xl font-extrabold text-sm transition shadow-md cursor-pointer active:scale-95"
              >
                <Camera className="w-5 h-5 text-[#f2c14e]" />
                <span>Capture Photo ({selectedImages.length + 1})</span>
              </button>
              <button
                type="button"
                onClick={stopCameraStream}
                className="inline-flex items-center gap-1.5 bg-[#f1f6f0] hover:bg-[#e0eee2] text-[#174327] px-4 py-2.5 rounded-xl border border-[#bcd6c0] text-xs font-bold transition cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#10b981]" />
                <span>Finish Capturing & Review</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* SECTION 3: UPLOAD OPTIONS (Upload Multiple Photos or Open Camera) */}
        {!isCameraOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option A: Select Multiple Images from Device */}
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
                  Select Multiple Photos
                </h3>
                <p className="text-xs text-[#55665b] mt-1 max-w-xs">
                  Choose one or multiple onion photos from your device at once.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#1c5a35] bg-white px-3 py-1 rounded-full border border-[#bcd6c0] shadow-2xs font-heading">
                Multi-select enabled (JPG, PNG, WebP)
              </span>
            </div>

            {/* Option B: Take Multiple Photos with Camera */}
            <div
              onClick={startCamera}
              className="p-6 rounded-2xl border-2 border-[#bcd6c0] hover:border-[#1c5a35] bg-[#f8faf8] hover:bg-[#f1f6f0] transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 shadow-2xs"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#174327] border border-[#0b2013] flex items-center justify-center text-[#f2c14e] shadow-xs">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#174327] font-heading">
                  Take Consecutive Photos
                </h3>
                <p className="text-xs text-[#55665b] mt-1 max-w-xs">
                  Live viewfinder allows snapping multiple onion photos consecutively.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#174327] bg-[#f2c14e] px-3 py-1 rounded-full shadow-2xs font-heading">
                Camera Viewfinder
              </span>
            </div>
          </div>
        )}

        {/* SECTION 4: THUMBNAILS PREVIEW GRID OF ALL SELECTED IMAGES */}
        {selectedImages.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#174327] font-heading border-b border-[#e4e1d3] pb-2">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#10b981]" />
                <span>Selected Photos ({selectedImages.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedImages([])}
                className="text-[#a93b2e] hover:text-[#c24535] inline-flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            {/* Grid of Preview Thumbnails */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {selectedImages.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-xl overflow-hidden bg-[#0b2013] aspect-square border-2 border-[#bcd6c0] shadow-xs flex items-center justify-center"
                >
                  <img
                    src={imgSrc}
                    alt={`Selected onion ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Photo Index Badge */}
                  <span className="absolute top-1.5 left-1.5 bg-[#0b2013]/80 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                  {/* Remove Individual Image Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#a93b2e] hover:bg-[#c24535] text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                    title="Remove this photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Quick Add More Tile */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-2 border-dashed border-[#cfcbb8] hover:border-[#1c5a35] hover:bg-[#f1f6f0] aspect-square flex flex-col items-center justify-center text-[#55665b] hover:text-[#1c5a35] cursor-pointer transition"
                title="Add more photos"
              >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-[11px] font-bold">Add More</span>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#e4e1d3]">
              <div className="text-xs text-[#55665b]">
                Ready to analyze <strong>{selectedImages.length}</strong> photo{selectedImages.length === 1 ? '' : 's'} across Main, Sprouted & Damaged AI models.
              </div>

              <button
                type="button"
                onClick={handleProceed}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1c5a35] hover:bg-[#174327] text-white px-8 py-3.5 rounded-xl font-extrabold text-sm transition shadow-md cursor-pointer active:scale-95"
              >
                <span>Analyze All ({selectedImages.length} Photo{selectedImages.length === 1 ? '' : 's'})</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
