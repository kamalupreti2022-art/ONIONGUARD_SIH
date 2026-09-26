import React, { useEffect, useState } from 'react';
import { Scan } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface AnalysisLoadingProps {
  onComplete: () => void;
  language: Language;
  isReady?: boolean;
}

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  onComplete,
  language,
  isReady = false,
}) => {
  const t = translations[language] || translations.en;
  const [progress, setProgress] = useState(30);
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  // If results are ready from the AI neural network, finish immediately!
  useEffect(() => {
    if (isReady) {
      setProgress(100);
      const doneTimer = setTimeout(() => {
        onCompleteRef.current();
      }, 140);
      return () => clearTimeout(doneTimer);
    }
  }, [isReady]);

  // Smooth visual progress while models execute
  useEffect(() => {
    if (isReady) return;

    const t1 = setTimeout(() => setProgress(55), 120);
    const t2 = setTimeout(() => setProgress(78), 260);
    const t3 = setTimeout(() => setProgress(92), 480);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isReady]);

  return (
    <div className="max-w-md mx-auto py-16 px-4 space-y-8">
      <div className="bg-[#122e1d] text-[#f4f1e4] rounded-3xl border-2 border-[#0a1f12] shadow-2xl p-8 sm:p-10 text-center space-y-6 relative overflow-hidden">
        {/* Subtle background radar/scanner line */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c5a35]/10 via-transparent to-[#1c5a35]/10 pointer-events-none" />

        {/* Central Animated Scanner Graphic */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-[#1c5a35] animate-ping opacity-30" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#174327] to-[#1c5a35] border border-[#2c5a3e] flex items-center justify-center text-[#f2c14e] shadow-xl z-10">
            <Scan className="w-10 h-10 animate-pulse stroke-[2.2]" />
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
            {t.analyzingOnion || "Analyzing onion..."}
          </h2>
          <p className="text-xs text-[#a9bfa9] mt-2">
            AI neural network is evaluating specimen quality
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="w-full bg-[#0b2013] rounded-full h-3 overflow-hidden p-0.5 border border-[#24462f]">
            <div 
              className="bg-gradient-to-r from-[#1c5a35] to-[#f2c14e] h-full rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#a9bfa9] px-1">
            <span>{t.analyzingOnion || "Analyzing onion..."}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
