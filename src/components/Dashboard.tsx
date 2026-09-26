import React from 'react';
import { 
  PlusCircle, 
  Layers, 
  FileText, 
  Award, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Eye, 
  Trash2
} from 'lucide-react';
import { AssessmentRecord, Language, ViewMode } from '../types';
import { translations } from '../utils/translations';
import { LivePriceIndicator } from './LivePriceIndicator';

interface DashboardProps {
  assessments: AssessmentRecord[];
  onNavigate: (view: ViewMode) => void;
  onSelectAssessment: (record: AssessmentRecord) => void;
  onDeleteAssessment: (reportId: string) => void;
  language: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({
  assessments,
  onNavigate,
  onSelectAssessment,
  onDeleteAssessment,
  language,
}) => {
  const t = translations[language] || translations.en;

  const totalBatches = assessments.length;
  const reportsGenerated = assessments.filter(a => a.status === 'Completed').length;
  const avgHealthy = totalBatches > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + (a.percentages.healthy || a.gradeA || 0), 0) / totalBatches)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Actions Bar with Live Price Indicator */}
      <div className="bg-[#122e1d] text-[#f4f1e4] p-6 sm:p-7 rounded-3xl border-2 border-[#0a1f12] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                {t.dashboard}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#a9bfa9]">
              AI-Assisted Onion Quality Assessment & Grading Dashboard
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('create-batch')}
              className="inline-flex items-center gap-1.5 bg-[#1c5a35] hover:bg-[#237342] text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.newBatchCTA}</span>
            </button>
          </div>
        </div>

        {/* Live MSP / Mandi Benchmark Price Indicator inside main dark-green section */}
        <LivePriceIndicator />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Batches */}
        <div className="bg-white p-5 rounded-2xl border border-[#cfcbb8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#55665b] uppercase tracking-wider">
              {t.totalBatches}
            </p>
            <h3 className="text-3xl font-extrabold text-[#174327] font-heading mt-1">
              {totalBatches}
            </h3>
            <p className="text-[11px] text-[#55665b] mt-0.5">
              Logged in local browser storage
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#f1f6f0] text-[#1c5a35] flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Reports Generated */}
        <div className="bg-white p-5 rounded-2xl border border-[#cfcbb8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#55665b] uppercase tracking-wider">
              {t.reportsGenerated}
            </p>
            <h3 className="text-3xl font-extrabold text-[#174327] font-heading mt-1">
              {reportsGenerated}
            </h3>
            <p className="text-[11px] text-[#1c5a35] font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Digital verification ready
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#e0eee2] text-[#1c5a35] flex items-center justify-center border border-[#bcd6c0]">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Average Quality */}
        <div className="bg-white p-5 rounded-2xl border border-[#cfcbb8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#55665b] uppercase tracking-wider">
              {t.avgQuality}
            </p>
            <h3 className="text-3xl font-extrabold text-[#174327] font-heading mt-1">
              {avgHealthy}%
            </h3>
            <p className="text-[11px] text-[#55665b] mt-0.5">
              Across assessed batches
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#f6ecd4] text-[#8a5f12] flex items-center justify-center border border-[#d9bf85]">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Assessments Section */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#e4e1d3] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#174327] font-heading">
              {t.recentAssessments}
            </h2>
            <p className="text-xs text-[#55665b]">
              Review and inspect batch quality certificates
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-[#1c5a35] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t.history}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {assessments.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f1f6f0] border border-[#bcd6c0] flex items-center justify-center text-[#1c5a35]">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#174327] font-heading">
                {t.noAssessmentsYet}
              </h3>
              <p className="text-xs text-[#55665b] mt-1 max-w-sm mx-auto">
                Capture or upload an onion photo to get an instant AI assessment.
              </p>
            </div>
            <button
              onClick={() => onNavigate('create-batch')}
              className="inline-flex items-center gap-2 bg-[#1c5a35] hover:bg-[#174327] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.newBatchCTA}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f6f0]">
            {assessments.slice(0, 5).map((item) => (
              <div
                key={item.reportId}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fcfdfa] transition"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#e0eee2] border border-[#bcd6c0] flex items-center justify-center text-[#1c5a35] font-bold text-xs font-mono shrink-0">
                    {item.percentages.healthy ?? item.gradeA}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1c2a20] font-heading">
                        {item.batch.batchId}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        (item.percentages.healthy ?? item.gradeA) >= 70
                          ? 'bg-[#e0eee2] text-[#1c5a35]'
                          : 'bg-[#f6e5e1] text-[#a93b2e]'
                      }`}>
                        {(item.percentages.healthy ?? item.gradeA) >= 70 ? 'HEALTHY' : 'UNHEALTHY'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#55665b] mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#1c5a35]" />
                        {item.batch.procurementCentre.split('(')[0].trim()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#55665b]" />
                        {item.batch.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      onSelectAssessment(item);
                      onNavigate('analysis-results');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#cfcbb8] text-xs font-bold text-[#1c2a20] hover:bg-[#f1f6f0] transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#55665b]" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => onDeleteAssessment(item.reportId)}
                    className="p-1.5 text-[#55665b] hover:text-[#a93b2e] rounded-lg transition cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
