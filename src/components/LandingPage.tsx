import React from 'react';
import { 
  Camera, 
  Cpu, 
  Award, 
  FileCheck2, 
  ArrowRight, 
  ShieldCheck, 
  Scale
} from 'lucide-react';
import { Language, ViewMode } from '../types';
import { translations } from '../utils/translations';
import { LivePriceIndicator } from './LivePriceIndicator';

interface LandingPageProps {
  onNavigate: (view: ViewMode) => void;
  language: Language;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  language,
}) => {
  const t = translations[language] || translations.en;

  const workflowSteps = [
    {
      step: '01',
      title: t.step1Title,
      desc: t.step1Desc,
      icon: <Camera className="w-5 h-5 text-[#1c5a35]" />,
      badge: 'bg-[#e0eee2] text-[#1c5a35] border border-[#bcd6c0]',
    },
    {
      step: '02',
      title: t.step2Title,
      desc: t.step2Desc,
      icon: <Cpu className="w-5 h-5 text-[#8a5f12]" />,
      badge: 'bg-[#f6ecd4] text-[#4d3504] border border-[#d9bf85]',
    },
    {
      step: '03',
      title: t.step3Title,
      desc: t.step3Desc,
      icon: <Award className="w-5 h-5 text-[#1c5a35]" />,
      badge: 'bg-[#e0eee2] text-[#1c5a35] border border-[#bcd6c0]',
    },
    {
      step: '04',
      title: t.step4Title,
      desc: t.step4Desc,
      icon: <FileCheck2 className="w-5 h-5 text-[#174327]" />,
      badge: 'bg-[#e0eee2] text-[#174327] border border-[#bcd6c0]',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner with KisanQ Forest Green & Harvest Gold Theme */}
      <section className="bg-gradient-to-r from-[#174327] to-[#1c5a35] text-white rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-[#0a1f12] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-96 h-96 text-[#f2c14e]" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#f2c14e] text-[#122e1d] text-xs font-extrabold font-heading px-3 py-1 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#122e1d] animate-pulse" />
            <span>AI Quality Inspection</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-heading">
            {t.heroHeading}
          </h1>

          <p className="text-[#d1e0d2] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
            {t.heroSubheading}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('create-batch')}
              className="inline-flex items-center gap-2 bg-[#f2c14e] hover:bg-[#e0b03d] text-[#122e1d] font-extrabold font-heading px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer text-sm sm:text-base active:scale-95"
            >
              <span>{t.startAssessment}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Live Official Mandi / Market Price inside main dark-green hero */}
          <div className="pt-4 max-w-xl">
            <LivePriceIndicator />
          </div>
        </div>
      </section>

      {/* Problem Context Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#e4e1d3] shadow-xs">
        <div className="grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1c5a35] bg-[#e0eee2] px-2.5 py-1 rounded-md border border-[#bcd6c0]">
              <Scale className="w-3.5 h-3.5" />
              <span>{t.problemStatementTitle}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#174327] font-heading">
              Transforming Subjective Visual Grading into Objective Digital Trust
            </h2>
            <p className="text-sm text-[#55665b] leading-relaxed">
              {t.problemStatementDesc}
            </p>
          </div>

          <div className="md:col-span-4 bg-[#f8faf8] p-5 rounded-2xl border border-[#bcd6c0] space-y-2.5 text-xs text-[#1c2a20]">
            <div className="font-bold text-[#174327] text-sm font-heading">
              Why Real AI Inspection?
            </div>
            <ul className="space-y-1.5 text-[#55665b]">
              <li className="flex items-start gap-1.5">
                <span className="text-[#1c5a35] font-bold">✓</span>
                <span>Real-time photo upload & device camera capture.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#1c5a35] font-bold">✓</span>
                <span>8 distinct trained model classes evaluated instantly.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#1c5a35] font-bold">✓</span>
                <span>Transparent HEALTHY vs UNHEALTHY percentages.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4-Step Inspection Workflow */}
      <section className="space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-2xl font-bold text-[#174327] font-heading">
              {t.workflowHeading}
            </h2>
            <p className="text-xs sm:text-sm text-[#55665b] mt-0.5">
              Standardized digital inspection protocol for onion procurement.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((s) => (
            <div
              key={s.step}
              className="bg-white rounded-3xl p-5 border-2 border-[#e4e1d3] hover:border-[#1c5a35]/40 transition-all shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.badge}`}>
                  {s.icon}
                </div>
                <span className="text-xs font-mono font-bold text-[#55665b]">
                  {s.step}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1c2a20] font-heading">
                  {s.title}
                </h3>
                <p className="text-xs text-[#55665b] mt-1 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
