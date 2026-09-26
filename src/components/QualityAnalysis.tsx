/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  RefreshCw, 
  AlertCircle, 
  BarChart3, 
  Check, 
  AlertTriangle,
  Flame,
  Send,
  Copy,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { AssessmentRecord, ImageAnalysisItem, Language } from '../types';
import { translations } from '../utils/translations';
import { getConfiguredMainModelUrl, getConfiguredSproutedModelUrl, getConfiguredDamagedModelUrl } from '../config/models';
import { maskPhoneNumber, getWhatsAppDirectUrl } from '../utils/whatsappService';

interface QualityAnalysisProps {
  record: AssessmentRecord;
  onGenerateReport: () => void;
  onReanalyze: () => void;
  language: Language;
}

export const QualityAnalysis: React.FC<QualityAnalysisProps> = ({
  record,
  onGenerateReport,
  onReanalyze,
  language,
}) => {
  const t = translations[language] || translations.en;

  // Active photo index for multiple images navigation (defaults to first photo: index 0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [copiedReport, setCopiedReport] = useState(false);
  const [showOverallSummary, setShowOverallSummary] = useState(false);

  const totalPhotos = record.imageItems?.length || record.images?.length || 1;
  const isMultipleImages = totalPhotos > 1;

  // Ensure index is within range
  const safeIndex = Math.min(Math.max(0, currentPhotoIndex), Math.max(0, totalPhotos - 1));

  // Current photo item
  const currentItem: ImageAnalysisItem | null = 
    record.imageItems && record.imageItems[safeIndex] 
      ? record.imageItems[safeIndex] 
      : null;

  // Current photo image source
  const currentImageSrc = 
    currentItem?.imageSrc || 
    (record.images && record.images[safeIndex]) || 
    (record.images && record.images[0]) || 
    '';

  // Navigation handlers
  const handlePrevPhoto = () => {
    if (!isMultipleImages) return;
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : totalPhotos - 1));
    setShowOverallSummary(false);
  };

  const handleNextPhoto = () => {
    if (!isMultipleImages) return;
    setCurrentPhotoIndex((prev) => (prev < totalPhotos - 1 ? prev + 1 : 0));
    setShowOverallSummary(false);
  };

  // Keyboard navigation support (< and >)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPhotos, isMultipleImages]);

  // If models are missing or failed to load
  if (record.modelAvailable === false) {
    const mainUrl = getConfiguredMainModelUrl();
    const sproutedUrl = getConfiguredSproutedModelUrl();
    const damagedUrl = getConfiguredDamagedModelUrl();

    return (
      <div className="space-y-6 pb-16 max-w-2xl mx-auto">
        <div className="bg-[#f6e5e1] border-2 border-[#e5c1ba] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#a93b2e] text-white flex items-center justify-center shadow-md">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#882216] font-heading">
              AI Model Unavailable
            </h2>
            <p className="text-sm font-semibold text-[#a93b2e] max-w-xl mx-auto mt-2 leading-relaxed">
              {record.modelNotice || 'Unable to perform quality assessment because the trained models could not be loaded.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#e5c1ba] text-xs text-[#55665b] text-left space-y-2">
            <div className="font-bold text-[#1c2a20] text-xs font-heading">
              Configured Model URLs:
            </div>
            <div className="text-[11px] font-mono text-[#1c5a35] bg-[#f8fafc] p-2 rounded-xl border border-[#cfcbb8] space-y-1">
              <div><strong>MAIN_MODEL:</strong> {mainUrl || '<Not Set>'}</div>
              <div><strong>SPROUTED_MODEL:</strong> {sproutedUrl || '<Not Set>'}</div>
              <div><strong>DAMAGED_MODEL:</strong> {damagedUrl || '<Not Set>'}</div>
            </div>
            <p className="text-[11px] text-[#55665b]">
              Please check the model configuration in <code>src/config/models.ts</code> or in Settings.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onReanalyze}
              className="inline-flex items-center gap-2 bg-[#1c5a35] hover:bg-[#174327] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Analysis</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active results to display:
  // If showing overall summary toggle is active, show batch aggregate. Otherwise, show current photo's result!
  const healthyPct = showOverallSummary
    ? record.percentages.healthy
    : (currentItem ? currentItem.healthyPercentage : record.percentages.healthy);

  const rottenPct = showOverallSummary
    ? record.percentages.rotten
    : (currentItem ? currentItem.rottenPercentage : record.percentages.rotten);

  const sproutedPct = showOverallSummary
    ? record.percentages.sprouted
    : (currentItem ? currentItem.sproutedPercentage : record.percentages.sprouted);

  const damagedPct = showOverallSummary
    ? record.percentages.damaged
    : (currentItem ? currentItem.damagedPercentage : record.percentages.damaged);

  const activeMainCategory = showOverallSummary
    ? (record.percentages.healthy >= 60 ? 'HEALTHY' : record.percentages.sprouted >= 30 ? 'SPROUTED' : 'ROTTEN')
    : (currentItem?.mainCategory || 'HEALTHY');

  // Detailed 10 detections for current photo or overall
  const detailedDetections = showOverallSummary
    ? (record.detailedDetections || [])
    : (currentItem?.detailedDetections || record.detailedDetections || []);

  const handleCopyReport = () => {
    if (record.farmerWhatsAppReport) {
      navigator.clipboard.writeText(record.farmerWhatsAppReport);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    }
  };

  const openWhatsAppDirect = () => {
    if (!record.batch.farmerPhone || !record.farmerWhatsAppReport) return;
    const url = getWhatsAppDirectUrl(record.batch.farmerPhone, record.farmerWhatsAppReport);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#174327] tracking-tight font-heading">
            {showOverallSummary 
              ? 'Consignment Quality Analysis' 
              : `Photo #${safeIndex + 1} Quality Analysis`}
          </h1>
          <p className="text-xs text-[#55665b] mt-0.5">
            {record.batch.batchId ? `Batch ID: ${record.batch.batchId}` : 'Quality Assessment'} • {record.totalAnalyzed} photo{record.totalAnalyzed === 1 ? '' : 's'} analyzed
            {isMultipleImages && !showOverallSummary && (
              <span className="font-semibold text-[#1c5a35] ml-2">
                (Viewing Photo {safeIndex + 1} of {totalPhotos})
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isMultipleImages && (
            <button
              onClick={() => setShowOverallSummary(!showOverallSummary)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition cursor-pointer ${
                showOverallSummary
                  ? 'bg-[#1c5a35] text-white border-[#1c5a35]'
                  : 'bg-[#f1f6f0] hover:bg-[#e0eee2] text-[#174327] border-[#bcd6c0]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showOverallSummary ? 'Back to Photo View' : 'Overall Batch View'}</span>
            </button>
          )}

          <button
            onClick={onReanalyze}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-[#f1f6f0] text-[#1c2a20] px-3.5 py-2 rounded-xl border border-[#cfcbb8] transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#55665b]" />
            <span>Re-scan</span>
          </button>

          <button
            onClick={onGenerateReport}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#1c5a35] hover:bg-[#174327] text-white px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Certificate</span>
          </button>
        </div>
      </div>

      {/* WHATSAPP REPORT DELIVERY STATUS BANNER */}
      {record.whatsappDelivery && (
        <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs ${
          record.whatsappDelivery.status === 'sent'
            ? 'bg-[#f0fdf4] border-[#86efac] text-[#166534]'
            : 'bg-[#fffbeb] border-[#fde68a] text-[#92400e]'
        }`}>
          <div className="flex items-start sm:items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0" />
            <div>
              <span className="font-extrabold uppercase tracking-wider block font-heading text-[11px]">
                Farmer WhatsApp Transparency Report Ready
              </span>
              <p className="mt-0.5">
                {record.whatsappDelivery.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {record.farmerWhatsAppReport && (
              <>
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shadow-2xs text-[#1c2a20]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedReport ? 'Copied!' : 'Copy Report'}</span>
                </button>
                {record.batch.farmerPhone && (
                  <button
                    type="button"
                    onClick={openWhatsAppDirect}
                    className="inline-flex items-center gap-1 bg-[#16a34a] hover:bg-[#15803d] text-white px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer shadow-xs active:scale-95"
                    title="Open directly in WhatsApp Web or Mobile App"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 2-COLUMN VIEW: IMAGE ON LEFT, RESULT ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================== */}
        {/* LEFT COLUMN: ACTIVE IMAGE + NEXT/PREV ARROWS + THUMBNAILS       */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-4 sm:p-5 shadow-xs space-y-4">
            
            {/* Top Image Header with Photo Counter & Status Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black font-heading text-[#174327] uppercase tracking-wider">
                  {isMultipleImages ? `Photo ${safeIndex + 1} of ${totalPhotos}` : 'Onion Specimen'}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  activeMainCategory === 'HEALTHY'
                    ? 'bg-[#e0eee2] text-[#1c5a35] border border-[#bcd6c0]'
                    : activeMainCategory === 'SPROUTED'
                    ? 'bg-[#fefce8] text-[#854d0e] border border-[#fef08a]'
                    : 'bg-[#f6e5e1] text-[#a93b2e] border border-[#e5c1ba]'
                }`}>
                  {activeMainCategory}
                </span>
              </div>

              {isMultipleImages && (
                <span className="text-[10px] font-semibold text-[#55665b]">
                  Use arrows to switch
                </span>
              )}
            </div>

            {/* Main Photo Display with Overlay Arrows */}
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-[#0b2013] border-2 border-[#cfcbb8] flex items-center justify-center shadow-inner group">
              {currentImageSrc ? (
                <img
                  src={currentImageSrc}
                  alt={`Onion specimen ${safeIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-white text-xs">No image available</div>
              )}

              {/* Floating Arrow Buttons on Image (when multiple images exist) */}
              {isMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/65 hover:bg-[#174327] text-white flex items-center justify-center transition shadow-lg backdrop-blur-xs cursor-pointer border border-white/20 active:scale-95"
                    title="Previous photo (Left Arrow)"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/65 hover:bg-[#174327] text-white flex items-center justify-center transition shadow-lg backdrop-blur-xs cursor-pointer border border-white/20 active:scale-95"
                    title="Next photo (Right Arrow)"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Photo Index Badge Overlay */}
              <div className="absolute bottom-2.5 left-2.5 bg-black/75 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/10">
                #{safeIndex + 1} / {totalPhotos}
              </div>
            </div>

            {/* Navigation Controls Bar Below Photo */}
            {isMultipleImages && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#f7f5ee] hover:bg-[#e0eee2] text-[#174327] font-bold text-xs border border-[#cfcbb8] transition cursor-pointer shadow-2xs active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="px-3 py-1.5 bg-[#f1f6f0] rounded-xl border border-[#bcd6c0] text-center">
                    <span className="text-xs font-mono font-black text-[#174327]">
                      {safeIndex + 1} / {totalPhotos}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1c5a35] hover:bg-[#174327] text-white font-bold text-xs transition cursor-pointer shadow-sm active:scale-95"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Thumbnails Strip */}
                {record.imageItems && record.imageItems.length > 1 && (
                  <div className="space-y-1.5 pt-1 border-t border-[#e4e1d3]">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#55665b] font-heading">
                      Select Photo Directly
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {record.imageItems.map((item, idx) => {
                        const isCurrent = idx === safeIndex;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setCurrentPhotoIndex(idx);
                              setShowOverallSummary(false);
                            }}
                            className={`shrink-0 relative w-13 h-13 rounded-xl overflow-hidden border-2 transition cursor-pointer p-0.5 ${
                              isCurrent
                                ? 'border-[#1c5a35] ring-2 ring-[#1c5a35]/40 scale-105'
                                : 'border-[#cfcbb8] hover:border-[#1c5a35] opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={item.imageSrc}
                              alt={`Thumb ${item.imageIndex}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white font-mono text-[8px] font-bold px-1 rounded">
                              #{item.imageIndex}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: AI ANALYSIS RESULT (HEALTHY, ROTTEN, SPROUTED)    */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 sm:p-7 shadow-xs space-y-6">
            
            {/* Classification Header */}
            <div className="flex items-center justify-between border-b border-[#e4e1d3] pb-3">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#55665b] font-heading">
                  {showOverallSummary 
                    ? 'Batch Average Classification' 
                    : `Specimen Classification (#${safeIndex + 1})`}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#174327] font-heading">
                  {showOverallSummary 
                    ? 'Overall Consignment Result' 
                    : `Photo #${safeIndex + 1} Result`}
                </h2>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-[#55665b] block uppercase">Classification</span>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  activeMainCategory === 'HEALTHY'
                    ? 'bg-[#e0eee2] text-[#1c5a35]'
                    : activeMainCategory === 'SPROUTED'
                    ? 'bg-[#fefce8] text-[#854d0e]'
                    : 'bg-[#f6e5e1] text-[#a93b2e]'
                }`}>
                  {activeMainCategory}
                </span>
              </div>
            </div>

            {/* 3 Main Result Cards: HEALTHY, ROTTEN, SPROUTED */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* 1. HEALTHY */}
              <div className="p-4 rounded-2xl border-2 border-[#bcd6c0] bg-[#e0eee2]/50 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#1c5a35] font-heading flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>HEALTHY</span>
                  </span>
                  <span className="text-[10px] text-[#1c5a35] font-semibold">4 classes</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-[#1c5a35] mt-1">
                  {healthyPct}%
                </div>
                <p className="text-[10px] text-[#1c5a35]/80">
                  Red & White healthy
                </p>
              </div>

              {/* 2. ROTTEN */}
              <div className="p-4 rounded-2xl border-2 border-[#e5c1ba] bg-[#f6e5e1]/50 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#a93b2e] font-heading flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#a93b2e]" />
                    <span>ROTTEN</span>
                  </span>
                  <span className="text-[10px] text-[#a93b2e] font-semibold">4 classes</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-[#a93b2e] mt-1">
                  {rottenPct}%
                </div>
                <p className="text-[10px] text-[#a93b2e]/80">
                  Red & White rotten
                </p>
              </div>

              {/* 3. SPROUTED */}
              <div className="p-4 rounded-2xl border-2 border-[#fef08a] bg-[#fefce8] shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#854d0e] font-heading flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ca8a04]" />
                    <span>SPROUTED</span>
                  </span>
                  <span className="text-[10px] text-[#854d0e] font-semibold">Sprouted model</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-[#854d0e] mt-1">
                  {sproutedPct}%
                </div>
                <p className="text-[10px] text-[#854d0e]/80">
                  Apical shoot growth
                </p>
              </div>
            </div>

            {/* Quality Summary & Protocol */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-[#bcd6c0] space-y-1">
                <span className="text-[10px] font-bold text-[#1c2a20] uppercase tracking-wider font-heading block">
                  Quality Summary
                </span>
                <p className="text-xs font-semibold text-[#174327] leading-relaxed">
                  {currentItem?.qualityInterpretation || record.qualitySummary}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f7f5ee] border border-[#cfcbb8] space-y-1">
                <span className="text-[10px] font-bold text-[#1c2a20] uppercase tracking-wider font-heading block">
                  Action Recommendation
                </span>
                <p className="text-xs text-[#55665b] leading-relaxed">
                  {currentItem?.recommendation || (healthyPct >= 70
                    ? 'Consignment satisfies Grade A threshold. Suitable for warehouse crating.'
                    : 'Defects observed. Segregate sprouted and decaying bulbs prior to auction.')}
                </p>
              </div>
            </div>

            {/* Detailed Detection (10 Distinct AI Classes) */}
            <div className="pt-3 border-t border-[#e4e1d3] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#174327] font-heading">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#1c5a35]" />
                  <span>Detailed Detections (10 Neural Classes)</span>
                </span>
                <span className="text-[10px] text-[#55665b] font-normal">
                  {showOverallSummary ? 'Batch Average' : `Photo #${safeIndex + 1}`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {detailedDetections.map((det) => (
                  <div 
                    key={det.key}
                    className="p-2.5 rounded-xl border border-[#cfcbb8] bg-[#fdfdfc] space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1c2a20] text-xs">{det.displayName}</span>
                      <span className={`font-mono font-black ${
                        det.category === 'HEALTHY'
                          ? 'text-[#1c5a35]'
                          : det.category === 'SPROUTED'
                          ? 'text-[#ca8a04]'
                          : det.category === 'DAMAGED'
                          ? 'text-[#d97706]'
                          : 'text-[#a93b2e]'
                      }`}>
                        {det.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          det.category === 'HEALTHY'
                            ? 'bg-[#10b981]'
                            : det.category === 'SPROUTED'
                            ? 'bg-[#eab308]'
                            : det.category === 'DAMAGED'
                            ? 'bg-[#f97316]'
                            : 'bg-[#ef4444]'
                        }`}
                        style={{ width: `${Math.min(100, det.percentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-[#55665b]">
                      <span className="capitalize">{det.sourceModel} model</span>
                      <span className="uppercase font-bold">{det.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OVERALL BATCH SUMMARY STRIP (If viewing single photo in a multi-image batch) */}
            {isMultipleImages && !showOverallSummary && (
              <div className="pt-3 border-t border-[#e4e1d3]">
                <div className="p-3.5 rounded-2xl bg-[#f7f5ee] border border-[#cfcbb8] flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div>
                    <span className="font-bold text-[#174327] font-heading block text-[11px] uppercase tracking-wider">
                      Overall Batch Average ({totalPhotos} photos)
                    </span>
                    <span className="text-[#55665b] text-[11px]">
                      Healthy: <strong className="text-[#1c5a35] font-mono">{record.percentages.healthy}%</strong> • 
                      Rotten: <strong className="text-[#a93b2e] font-mono">{record.percentages.rotten}%</strong> • 
                      Sprouted: <strong className="text-[#854d0e] font-mono">{record.percentages.sprouted}%</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowOverallSummary(true)}
                    className="text-xs font-bold text-[#1c5a35] hover:text-[#174327] underline cursor-pointer"
                  >
                    View Batch Summary Table
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FARMER WHATSAPP REPORT PREVIEW SECTION */}
      {record.farmerWhatsAppReport && (
        <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#174327] font-heading flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1c5a35]" />
              <span>Farmer WhatsApp Audit Report</span>
            </span>
            {record.batch.farmerPhone && (
              <span className="text-xs font-mono text-[#55665b]">
                Recipient: {maskPhoneNumber(record.batch.farmerPhone)}
              </span>
            )}
          </div>

          <pre className="p-4 rounded-2xl bg-[#0b2013] text-[#d1e0d2] text-xs font-mono whitespace-pre-wrap leading-relaxed border border-[#24462f] shadow-inner overflow-x-auto">
            {record.farmerWhatsAppReport}
          </pre>
        </div>
      )}
    </div>
  );
};
