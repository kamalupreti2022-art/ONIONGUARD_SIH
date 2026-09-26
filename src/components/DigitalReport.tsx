/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  Check, 
  Flame, 
  AlertTriangle,
  Sparkles,
  Phone
} from 'lucide-react';
import { AssessmentRecord, Language } from '../types';
import { translations } from '../utils/translations';
import { maskPhoneNumber } from '../utils/whatsappService';

interface DigitalReportProps {
  record: AssessmentRecord;
  onBackToDashboard: () => void;
  language: Language;
}

export const DigitalReport: React.FC<DigitalReportProps> = ({
  record,
  onBackToDashboard,
  language,
}) => {
  const t = translations[language] || translations.en;

  const handlePrint = () => {
    window.print();
  };

  const healthyPercentage = record.percentages.healthy;
  const rottenPercentage = record.percentages.rotten;
  const sproutedPercentage = record.percentages.sprouted;

  const handleDownload = () => {
    const reportData = {
      title: "ONION QUALITY ASSESSMENT REPORT",
      reportId: record.reportId,
      batchId: record.batch.batchId,
      procurementCentre: record.batch.procurementCentre,
      inspector: record.batch.inspectorName,
      farmerPhone: record.batch.farmerPhone ? maskPhoneNumber(record.batch.farmerPhone) : undefined,
      dateTime: record.timestamp,
      onionVariety: record.batch.onionVariety,
      approxQuantity: record.batch.approxQuantity,
      photosAnalyzed: record.totalAnalyzed,
      classificationResult: {
        healthyPercentage: `${healthyPercentage}%`,
        rottenPercentage: `${rottenPercentage}%`,
        sproutedPercentage: `${sproutedPercentage}%`,
      },
      detailedDetections: record.detailedDetections || [],
      assessmentSummary: record.qualitySummary,
      farmerWhatsAppReport: record.farmerWhatsAppReport,
      whatsappDelivery: record.whatsappDelivery,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OnionQualityReport_${record.batch.batchId}_${record.reportId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Action buttons (hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#cfcbb8] shadow-xs">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#1c2a20] hover:bg-[#f1f6f0] bg-white border border-[#cfcbb8] px-4 py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToDashboard}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#1c2a20] bg-white hover:bg-[#f1f6f0] border border-[#cfcbb8] px-4 py-2.5 rounded-xl transition shadow-2xs cursor-pointer"
            title="Download full JSON audit record"
          >
            <Download className="w-4 h-4 text-[#55665b]" />
            <span>{t.downloadReport}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#1c5a35] hover:bg-[#174327] px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer active:scale-95"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printReport}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="printable-card bg-white rounded-3xl border-2 border-[#cfcbb8] shadow-sm p-6 sm:p-10 space-y-8 relative overflow-hidden">
        {/* Official Header */}
        <div className="border-b-2 border-[#1c2a20] pb-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#174327] border border-[#0e2f1c] flex items-center justify-center text-[#f2c14e] shadow-md font-heading font-extrabold text-xl">
                OG
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#174327] tracking-tight font-heading">
                  {t.reportTitle}
                </h1>
                <p className="text-xs text-[#1c5a35] font-bold">
                  OnionGuard AI Automated Multi-Model Quality Assurance Report
                </p>
              </div>
            </div>

            {/* QR Code Verification Simulation */}
            <div className="hidden sm:flex flex-col items-center text-center p-2.5 bg-[#f7f5ee] rounded-2xl border border-[#cfcbb8] text-[10px] text-[#55665b]">
              <svg className="w-14 h-14 text-[#1c2a20]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" fill="#1c2a20"/>
                <rect x="14" y="3" width="7" height="7" rx="1" fill="#1c2a20"/>
                <rect x="3" y="14" width="7" height="7" rx="1" fill="#1c2a20"/>
                <path d="M14 14h2v2h-2z M18 14h3v3h-3z M14 18h3v3h-3z M19 19h2v2h-2z" fill="#1c2a20" />
              </svg>
              <span className="font-mono mt-1 text-[9px] font-bold">{record.reportId}</span>
            </div>
          </div>

          {/* Report Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div className="space-y-0.5">
              <span className="text-[#55665b] font-semibold uppercase text-[10px] block">{t.batchId}</span>
              <span className="font-mono font-bold text-[#1c2a20] text-xs sm:text-sm">{record.batch.batchId}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[#55665b] font-semibold uppercase text-[10px] block">{t.dateTime}</span>
              <span className="font-bold text-[#1c2a20]">{record.batch.date}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[#55665b] font-semibold uppercase text-[10px] block">{t.onionVariety}</span>
              <span className="font-bold text-[#1c2a20] font-heading">{record.batch.onionVariety}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[#55665b] font-semibold uppercase text-[10px] block">{t.approxQuantity}</span>
              <span className="font-bold text-[#1c2a20]">{record.batch.approxQuantity}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs border-t border-[#f1f6f0]">
            <div>
              <span className="text-[#55665b] font-semibold uppercase text-[10px] block">{t.procurementCentreLabel}</span>
              <span className="font-bold text-[#1c2a20]">{record.batch.procurementCentre}</span>
            </div>
            <div>
              <span className="text-[#55665b] font-semibold uppercase text-[10px] block">{t.inspectorName}</span>
              <span className="font-bold text-[#1c2a20]">{record.batch.inspectorName}</span>
            </div>
            <div>
              <span className="text-[#55665b] font-semibold uppercase text-[10px] block">Farmer WhatsApp</span>
              <span className="font-bold font-mono text-[#1c2a20]">
                {record.batch.farmerPhone ? maskPhoneNumber(record.batch.farmerPhone) : 'Not recorded'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: MAIN CLASSIFICATION RESULT (HEALTHY, ROTTEN, SPROUTED) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e4e1d3] pb-2">
            <h2 className="text-sm font-black text-[#174327] uppercase tracking-wider font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8a5f12]" />
              <span>AI QUALITY CLASSIFICATION RESULT</span>
            </h2>
            <span className="text-xs font-bold text-[#55665b]">
              Photos Analyzed: <span className="font-mono font-black text-[#1c2a20]">{record.totalAnalyzed}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* HEALTHY */}
            <div className="p-4 rounded-2xl border-2 border-[#bcd6c0] bg-[#e0eee2]/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#1c5a35] uppercase tracking-wider">HEALTHY</span>
                <div className="text-2xl sm:text-3xl font-black text-[#174327] font-heading mt-0.5">{healthyPercentage}%</div>
                <p className="text-[10px] text-[#1c5a35] mt-0.5">Sum of 4 healthy classes</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#1c5a35] text-white flex items-center justify-center font-bold">
                <Check className="w-5 h-5" />
              </div>
            </div>

            {/* ROTTEN */}
            <div className="p-4 rounded-2xl border-2 border-[#e5c1ba] bg-[#f6e5e1]/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#a93b2e] uppercase tracking-wider">ROTTEN</span>
                <div className="text-2xl sm:text-3xl font-black text-[#a93b2e] font-heading mt-0.5">{rottenPercentage}%</div>
                <p className="text-[10px] text-[#a93b2e] mt-0.5">Sum of 4 rotten classes</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#a93b2e] text-white flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            {/* SPROUTED */}
            <div className="p-4 rounded-2xl border-2 border-[#fef08a] bg-[#fefce8] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#854d0e] uppercase tracking-wider">SPROUTED</span>
                <div className="text-2xl sm:text-3xl font-black text-[#854d0e] font-heading mt-0.5">{sproutedPercentage}%</div>
                <p className="text-[10px] text-[#854d0e] mt-0.5">Sprouted neural network</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#ca8a04] text-white flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 10 Detailed Detections Breakdown Table */}
          {record.detailedDetections && record.detailedDetections.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-[#174327] uppercase tracking-wider font-heading mb-2">
                Detailed 10-Class Neural Network Detections
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#f7f5ee] text-[#55665b] font-bold uppercase tracking-wider text-[10px] border-b border-[#cfcbb8]">
                      <th className="py-2 px-3">Class</th>
                      <th className="py-2 px-3">Model</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 text-right">Confidence %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f6f0]">
                    {record.detailedDetections.map((det) => (
                      <tr key={det.key}>
                        <td className="py-2 px-3 font-medium text-[#1c2a20]">{det.displayName}</td>
                        <td className="py-2 px-3 capitalize text-[#55665b]">{det.sourceModel}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            det.category === 'HEALTHY' 
                              ? 'bg-[#e0eee2] text-[#1c5a35]' 
                              : det.category === 'SPROUTED'
                              ? 'bg-[#fefce8] text-[#854d0e]'
                              : det.category === 'DAMAGED'
                              ? 'bg-[#fff7ed] text-[#c2410c]'
                              : 'bg-[#f6e5e1] text-[#a93b2e]'
                          }`}>
                            {det.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">{det.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: ASSESSMENT SUMMARY */}
        <div className="space-y-2 bg-[#f7f5ee] p-4.5 rounded-2xl border border-[#cfcbb8] text-xs">
          <h3 className="font-bold text-[#174327] uppercase tracking-wider font-heading">{t.assessmentSummary}</h3>
          <p className="text-[#1c2a20] leading-relaxed">
            "{record.qualitySummary}"
          </p>
        </div>

        {/* Signatures & Verification Stamp */}
        <div className="pt-6 border-t border-[#cfcbb8] grid grid-cols-2 gap-8 text-xs text-[#55665b]">
          <div className="space-y-4">
            <div className="font-mono text-[10px] text-[#55665b]">
              HASH: SHA256-{record.reportId.replace(/-/g, '')}
            </div>
            <div className="pt-6 border-t border-[#cfcbb8]">
              <span className="font-bold text-[#1c2a20] block">Digitally Certified</span>
              <span>OnionGuard AI Inspection System</span>
            </div>
          </div>

          <div className="space-y-4 text-right">
            <div className="font-mono text-[10px] text-[#55665b]">
              Onion Quality Assessment Ledger
            </div>
            <div className="pt-6 border-t border-[#cfcbb8]">
              <span className="font-bold text-[#1c2a20] block">{record.batch.inspectorName}</span>
              <span>Verification Officer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
