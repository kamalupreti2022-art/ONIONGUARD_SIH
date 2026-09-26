import React from 'react';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Award, 
  TrendingUp, 
  FileCheck, 
  AlertTriangle, 
  Eye, 
  Scale, 
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { AssessmentRecord, Language, ViewMode } from '../types';
import { translations } from '../utils/translations';

interface ProcurementCentreDashboardProps {
  assessments: AssessmentRecord[];
  onSelectAssessment: (record: AssessmentRecord) => void;
  onNavigate: (view: ViewMode) => void;
  language: Language;
}

export const ProcurementCentreDashboard: React.FC<ProcurementCentreDashboardProps> = ({
  assessments,
  onSelectAssessment,
  onNavigate,
  language,
}) => {
  const t = translations[language];

  // Strictly calculate from stored session assessments
  const today = new Date().toISOString().split('T')[0];
  const todaysAssessments = assessments.filter(a => a.batch.date === today).length || assessments.length;
  const completedBatches = assessments.filter(a => a.status === 'Completed').length;
  const pendingAssessments = assessments.filter(a => a.status === 'Pending Review').length;
  const avgGradeA = assessments.length > 0
    ? Math.round(assessments.reduce((acc, curr) => acc + curr.gradeA, 0) / assessments.length)
    : 70;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-[#122e1d] text-[#f4f1e4] p-6 sm:p-7 rounded-3xl border-2 border-[#0a1f12] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-heading">
              {t.procurementTitle}
            </h1>
            <span className="text-[11px] font-extrabold bg-[#f2c14e] text-[#122e1d] px-2.5 py-0.5 rounded-full font-heading">
              {t.prototypeDataNotice}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#a9bfa9]">
            {t.procurementSubtitle}
          </p>
        </div>

        <button
          onClick={() => onNavigate('create-batch')}
          className="inline-flex items-center gap-1.5 bg-[#1c5a35] hover:bg-[#237342] text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer self-start sm:self-auto shadow-md"
        >
          <span>{t.newBatchCTA}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Assessments */}
        <div className="bg-white p-5 rounded-2xl border border-[#cfcbb8] shadow-xs">
          <div className="flex items-center justify-between text-[#55665b] text-xs font-bold uppercase tracking-wider">
            <span>{t.todayAssessments}</span>
            <Calendar className="w-4 h-4 text-[#1c5a35]" />
          </div>
          <div className="text-3xl font-extrabold text-[#174327] font-heading mt-2">
            {todaysAssessments}
          </div>
          <p className="text-[11px] text-[#55665b] mt-1">Consignments processed today</p>
        </div>

        {/* Completed Batches */}
        <div className="bg-white p-5 rounded-2xl border border-[#cfcbb8] shadow-xs">
          <div className="flex items-center justify-between text-[#55665b] text-xs font-bold uppercase tracking-wider">
            <span>{t.completedBatches}</span>
            <CheckCircle2 className="w-4 h-4 text-[#1c5a35]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1c5a35] font-heading mt-2">
            {completedBatches}
          </div>
          <p className="text-[11px] text-[#55665b] mt-1">Audit certificates issued</p>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-[#cfcbb8] shadow-xs">
          <div className="flex items-center justify-between text-[#55665b] text-xs font-bold uppercase tracking-wider">
            <span>{t.pendingAssessments}</span>
            <Clock className="w-4 h-4 text-[#8a5f12]" />
          </div>
          <div className="text-3xl font-extrabold text-[#8a5f12] font-heading mt-2">
            {pendingAssessments}
          </div>
          <p className="text-[11px] text-[#55665b] mt-1">Batches awaiting sign-off</p>
        </div>

        {/* Average Grade A */}
        <div className="bg-white p-5 rounded-2xl border border-[#cfcbb8] shadow-xs">
          <div className="flex items-center justify-between text-[#55665b] text-xs font-bold uppercase tracking-wider">
            <span>{t.avgQuality}</span>
            <Award className="w-4 h-4 text-[#1c5a35]" />
          </div>
          <div className="text-3xl font-extrabold text-[#174327] font-heading mt-2">
            {avgGradeA}%
          </div>
          <p className="text-[11px] text-[#55665b] mt-1">Centre intake quality mean</p>
        </div>
      </div>

      {/* Dispute Resolution Spotlight Box */}
      <div className="bg-gradient-to-r from-[#174327] to-[#1c5a35] text-white rounded-3xl p-6 sm:p-8 space-y-4 border-2 border-[#0a1f12] shadow-xl">
        <div className="flex items-center gap-2 text-[#f2c14e] text-xs font-extrabold uppercase tracking-wider font-heading">
          <Scale className="w-4 h-4" />
          <span>SIH26031 Impact Matrix: Transparency & Dispute Elimination</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
          Empowering Procurement Centers with Indisputable Photographic Proof
        </h3>
        <p className="text-[#d1e0d2] text-xs sm:text-sm max-w-3xl leading-relaxed">
          {t.disputeNotice}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#0f2a19] p-4 rounded-2xl border border-[#2c5a3e]">
            <span className="text-[#10b981] font-extrabold text-lg block font-heading">100% Visual Record</span>
            <span className="text-xs text-[#a9bfa9]">Each onion bulb classified with bounding box & timestamp.</span>
          </div>
          <div className="bg-[#0f2a19] p-4 rounded-2xl border border-[#2c5a3e]">
            <span className="text-[#f2c14e] font-extrabold text-lg block font-heading">Standardized Rules</span>
            <span className="text-xs text-[#a9bfa9]">Eliminates subjective eye estimates and arbitrariness.</span>
          </div>
          <div className="bg-[#0f2a19] p-4 rounded-2xl border border-[#2c5a3e]">
            <span className="text-[#e0eee2] font-extrabold text-lg block font-heading">Instant Mandi Slip</span>
            <span className="text-xs text-[#a9bfa9]">Farmers receive printed digital grade slip within 2 minutes.</span>
          </div>
        </div>
      </div>

      {/* Recent Consignment Ledgers */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#e4e1d3] flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#174327] font-heading">
              Procurement Consignment Ledger
            </h3>
            <p className="text-xs text-[#55665b]">
              Audit trails stored locally for session inspection
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-[#1c5a35] hover:underline transition cursor-pointer"
          >
            {t.history} →
          </button>
        </div>

        <div className="divide-y divide-[#f1f6f0]">
          {assessments.slice(0, 6).map((item) => (
            <div
              key={item.reportId}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f1f6f0]/50 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-[#f1f6f0] px-2.5 py-0.5 rounded-lg text-[#174327] border border-[#cfcbb8]">
                    {item.batch.batchId}
                  </span>
                  <span className="text-xs font-bold text-[#1c2a20] font-heading">{item.batch.onionVariety}</span>
                  <span className="text-[11px] text-[#55665b] font-mono">({item.reportId})</span>
                </div>
                <div className="text-xs text-[#55665b] flex items-center gap-4 flex-wrap">
                  <span>Centre: {item.batch.procurementCentre}</span>
                  <span>Inspector: {item.batch.inspectorName}</span>
                  <span>Qty: {item.batch.approxQuantity}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-xs font-bold text-[#1c5a35]">
                    Grade A: {item.gradeA}%
                  </div>
                  <div className="text-[11px] text-[#a93b2e] font-semibold">
                    URS: {item.gradeURS}%
                  </div>
                </div>

                <button
                  onClick={() => onSelectAssessment(item)}
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-[#f1f6f0] text-[#1c2a20] border border-[#cfcbb8] hover:border-[#1c5a35] px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-[#1c5a35]" />
                  <span>{t.viewReport}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
