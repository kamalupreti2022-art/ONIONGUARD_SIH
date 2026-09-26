import React, { useState } from 'react';
import { 
  FileText, 
  RefreshCw,
  AlertCircle,
  BarChart3,
  Check,
  XCircle,
  CheckCircle2,
  Layers,
  Award
} from 'lucide-react';
import { AssessmentRecord, ImageAnalysisItem, Language } from '../types';
import { translations } from '../utils/translations';
import { getActiveModelUrl } from '../utils/tfModelService';

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
  const [selectedItem, setSelectedItem] = useState<ImageAnalysisItem | null>(
    record.imageItems && record.imageItems.length > 0 ? record.imageItems[0] : null
  );

  const isMultiItem = Boolean(record.imageItems && record.imageItems.length > 1);

  // If model is missing / failed to load
  if (record.modelAvailable === false) {
    const activeUrl = getActiveModelUrl();
    return (
      <div className="space-y-6 pb-16 max-w-2xl mx-auto">
        <div className="bg-[#f6e5e1] border-2 border-[#e5c1ba] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#a93b2e] text-white flex items-center justify-center shadow-md">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#882216] font-heading">
              {t.modelUnavailableTitle}
            </h2>
            <p className="text-sm font-semibold text-[#a93b2e] max-w-xl mx-auto mt-2 leading-relaxed">
              {t.modelUnavailableMessage}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#e5c1ba] text-xs text-[#55665b] text-left space-y-2">
            <div className="font-bold text-[#1c2a20] text-xs font-heading">
              Model Connection Guide:
            </div>
            <p>
              Please place your trained model files in <code>public/models/onion-quality/</code> or provide a valid model URL in Settings.
            </p>
            <div className="text-[11px] font-mono text-[#1c5a35] bg-[#f8fafc] p-2 rounded-xl border border-[#cfcbb8]">
              Checked URL: {activeUrl}
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onReanalyze}
              className="inline-flex items-center gap-2 bg-[#1c5a35] hover:bg-[#174327] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.reanalyzeCTA}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeSpecimen = selectedItem || (record.imageItems && record.imageItems.length > 0 ? record.imageItems[0] : null);

  const healthyPct = activeSpecimen ? (activeSpecimen.healthyPercentage ?? 0) : (record.percentages.healthy ?? 0);
  const unhealthyPct = activeSpecimen ? (activeSpecimen.unhealthyPercentage ?? 0) : (record.percentages.unhealthy ?? 0);
  const isHealthy = healthyPct >= unhealthyPct;

  const healthyDetails = activeSpecimen?.healthyClassDetails || [
    { className: 'red healthy onions(single)', displayName: t.classRedHealthySingle, probability: 0, percentage: 0, isHealthyGroup: true },
    { className: 'white healthy onions(single)', displayName: t.classWhiteHealthySingle, probability: 0, percentage: 0, isHealthyGroup: true },
    { className: 'red healthy onions(bulk)', displayName: t.classRedHealthyBulk, probability: 0, percentage: 0, isHealthyGroup: true },
    { className: 'white healthy onions(bulk)', displayName: t.classWhiteHealthyBulk, probability: 0, percentage: 0, isHealthyGroup: true },
  ];

  const unhealthyDetails = activeSpecimen?.unhealthyClassDetails || [
    { className: 'red rotten onions(single)', displayName: t.classRedRottenSingle, probability: 0, percentage: 0, isHealthyGroup: false },
    { className: 'white rotten onions(single)', displayName: t.classWhiteRottenSingle, probability: 0, percentage: 0, isHealthyGroup: false },
    { className: 'red rotten onions(bulk)', displayName: t.classRedRottenBulk, probability: 0, percentage: 0, isHealthyGroup: false },
    { className: 'white rotten onions(bulk)', displayName: t.classWhiteRottenBulk, probability: 0, percentage: 0, isHealthyGroup: false },
  ];

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#174327] tracking-tight font-heading">
            {t.qualityAnalysisTitle}
          </h1>
          <p className="text-xs text-[#55665b] mt-0.5">
            {record.batch.batchId ? `Batch ID: ${record.batch.batchId}` : 'Quality Assessment'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReanalyze}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-[#f1f6f0] text-[#1c2a20] px-3.5 py-2 rounded-xl border border-[#cfcbb8] transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#55665b]" />
            <span>{t.reanalyzeCTA}</span>
          </button>
          <button
            onClick={onGenerateReport}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#1c5a35] hover:bg-[#174327] text-white px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.generateReportCTA}</span>
          </button>
        </div>
      </div>

      {/* PRIMARY CLASSIFICATION CARD */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Image Preview */}
          <div className="md:col-span-5 space-y-2">
            <div className="relative rounded-2xl overflow-hidden bg-[#0b2013] aspect-square flex items-center justify-center border-2 border-[#cfcbb8] shadow-xs">
              <img
                src={activeSpecimen?.imageSrc || (record.images && record.images[0]) || ''}
                alt="Onion specimen"
                className="w-full h-full object-contain"
              />
              <div className={`absolute bottom-3 left-3 right-3 text-xs font-extrabold uppercase px-3 py-2 rounded-xl text-center shadow-md tracking-wider flex items-center justify-center gap-1.5 ${
                isHealthy 
                  ? 'bg-[#1c5a35] text-white border border-[#10b981]' 
                  : 'bg-[#a93b2e] text-white border border-[#e5c1ba]'
              }`}>
                {isHealthy ? (
                  <>
                    <Check className="w-4 h-4 text-[#10b981]" />
                    <span>HEALTHY — {healthyPct}%</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-[#fca5a5]" />
                    <span>UNHEALTHY — {unhealthyPct}%</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* MAIN RESULT: ONLY HEALTHY AND UNHEALTHY */}
          <div className="md:col-span-7 space-y-4">
            <div className={`p-5 rounded-2xl border-2 space-y-4 ${
              isHealthy ? 'bg-[#e0eee2]/60 border-[#10b981]' : 'bg-[#f6e5e1]/60 border-[#a93b2e]'
            }`}>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#55665b] font-heading">
                {t.mainAssessmentResult}
              </div>

              {/* Exact format required: HEALTHY — XX% and UNHEALTHY — XX% */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#bcd6c0] shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#10b981]" />
                    <span className="text-lg sm:text-xl font-black font-heading text-[#1c5a35]">
                      HEALTHY
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-[#1c5a35]">
                    {healthyPct}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e5c1ba] shadow-2xs">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-[#a93b2e]" />
                    <span className="text-lg sm:text-xl font-black font-heading text-[#a93b2e]">
                      UNHEALTHY
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-[#a93b2e]">
                    {unhealthyPct}%
                  </span>
                </div>
              </div>

              {/* Combined Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="w-full bg-[#f1f5f9] rounded-full h-3 overflow-hidden p-0.5 flex border border-[#cfcbb8]">
                  <div
                    className="h-full rounded-l-full bg-[#10b981] transition-all duration-500 ease-out"
                    style={{ width: `${healthyPct}%` }}
                    title={`Healthy: ${healthyPct}%`}
                  />
                  <div
                    className="h-full rounded-r-full bg-[#a93b2e] transition-all duration-500 ease-out"
                    style={{ width: `${unhealthyPct}%` }}
                    title={`Unhealthy: ${unhealthyPct}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#55665b] px-0.5">
                  <span className="text-[#1c5a35] font-bold">HEALTHY: {healthyPct}%</span>
                  <span className="text-[#a93b2e] font-bold">UNHEALTHY: {unhealthyPct}%</span>
                </div>
              </div>
            </div>

            {/* Quality Interpretation */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#1c2a20] uppercase tracking-wider font-heading block">
                {t.qualityInterpretation}:
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#174327] bg-[#f1f6f0] p-3 rounded-xl border border-[#bcd6c0]">
                {isHealthy ? t.goodQuality : t.spoilageDetected}
              </p>
            </div>

            {/* Recommendation */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#1c2a20] uppercase tracking-wider font-heading block">
                {t.recommendation}:
              </span>
              <p className="text-xs sm:text-sm text-[#55665b] bg-[#f7f5ee] p-3 rounded-xl border border-[#cfcbb8]">
                {isHealthy ? t.suitableStorage : t.separateProduce}
              </p>
            </div>
          </div>
        </div>

        {/* DETAILED INFORMATION: 8 MODEL CLASSES (Healthy Details & Unhealthy Details) */}
        <div className="pt-4 border-t border-[#e4e1d3] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#174327] font-heading">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#1c5a35]" />
              <span>{t.detailsTitle}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Healthy Details Group */}
            <div className="bg-[#f8faf8] border border-[#bcd6c0] rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-[#1c5a35] font-heading border-b border-[#e0eee2] pb-2 text-xs">
                <span>{t.healthyDetails}</span>
                <span className="font-mono text-xs font-bold">{healthyPct}%</span>
              </div>

              <div className="space-y-2">
                {healthyDetails.map((cls) => (
                  <div key={cls.className} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#1c2a20] font-medium">{cls.displayName}</span>
                      <span className="font-mono font-bold text-[#1c5a35]">{cls.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#e2e8f0] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#10b981] transition-all duration-300"
                        style={{ width: `${Math.min(100, cls.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unhealthy Details Group */}
            <div className="bg-[#fffafa] border border-[#e5c1ba] rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-[#a93b2e] font-heading border-b border-[#f6e5e1] pb-2 text-xs">
                <span>{t.unhealthyDetails}</span>
                <span className="font-mono text-xs font-bold">{unhealthyPct}%</span>
              </div>

              <div className="space-y-2">
                {unhealthyDetails.map((cls) => (
                  <div key={cls.className} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#1c2a20] font-medium">{cls.displayName}</span>
                      <span className="font-mono font-bold text-[#a93b2e]">{cls.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#e2e8f0] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#a93b2e] transition-all duration-300"
                        style={{ width: `${Math.min(100, cls.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector if multi-image */}
        {isMultiItem && record.imageItems && (
          <div className="pt-4 border-t border-[#e4e1d3] space-y-2">
            <span className="text-xs font-bold text-[#55665b] font-heading block">
              Analyzed Specimens ({record.imageItems.length}):
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {record.imageItems.map((item) => {
                const isSelected = activeSpecimen?.id === item.id;
                const itemHealthy = item.mainCategory === 'HEALTHY';
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-1.5 rounded-xl border-2 transition cursor-pointer text-center ${
                      isSelected
                        ? itemHealthy
                          ? 'border-[#10b981] shadow-xs'
                          : 'border-[#a93b2e] shadow-xs'
                        : 'border-[#cfcbb8] hover:border-[#1c5a35]'
                    }`}
                  >
                    <img
                      src={item.imageSrc}
                      alt={`Specimen ${item.imageIndex}`}
                      className="w-full aspect-square object-contain rounded-lg bg-[#0b2013]"
                    />
                    <span className="text-[10px] font-bold block truncate mt-1">
                      #{item.imageIndex}: {itemHealthy ? 'HEALTHY' : 'UNHEALTHY'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
