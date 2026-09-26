import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  FileText, 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Layers, 
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { AssessmentRecord, Language, ViewMode } from '../types';
import { translations } from '../utils/translations';

interface HistoryPageProps {
  assessments: AssessmentRecord[];
  onSelectAssessment: (record: AssessmentRecord) => void;
  onDeleteAssessment: (reportId: string) => void;
  onNavigate: (view: ViewMode) => void;
  onClearAll: () => void;
  language: Language;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  assessments,
  onSelectAssessment,
  onDeleteAssessment,
  onNavigate,
  onClearAll,
  language,
}) => {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'highGradeA' | 'highURS'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = assessments.filter(record => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      record.batch.batchId.toLowerCase().includes(term) ||
      record.reportId.toLowerCase().includes(term) ||
      record.batch.procurementCentre.toLowerCase().includes(term) ||
      record.batch.inspectorName.toLowerCase().includes(term) ||
      record.batch.onionVariety.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (filterType === 'highGradeA') {
      return record.gradeA >= 70;
    }
    if (filterType === 'highURS') {
      return record.gradeURS >= 25;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-[#e4e1d3] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#174327] tracking-tight font-heading">
              {t.historyTitle}
            </h1>
            <span className="text-xs font-mono font-bold bg-[#f1f6f0] text-[#1c5a35] px-2.5 py-0.5 rounded-full border border-[#bcd6c0]">
              {assessments.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#55665b] mt-1">
            {t.historySubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('create-batch')}
            className="inline-flex items-center gap-1.5 bg-[#1c5a35] hover:bg-[#174327] text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.newBatchCTA}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#cfcbb8] shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#55665b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#f7f5ee] border border-[#cfcbb8] rounded-xl focus:bg-white focus:border-[#1c5a35] focus:ring-2 focus:ring-[#1c5a35]/20 outline-none transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-2 rounded-xl font-bold font-heading transition cursor-pointer shrink-0 ${
              filterType === 'all'
                ? 'bg-[#1c5a35] text-white shadow-xs'
                : 'bg-white border border-[#cfcbb8] text-[#55665b] hover:bg-[#f1f6f0]'
            }`}
          >
            {t.filterAll}
          </button>
          <button
            onClick={() => setFilterType('highGradeA')}
            className={`px-3.5 py-2 rounded-xl font-bold font-heading transition cursor-pointer shrink-0 ${
              filterType === 'highGradeA'
                ? 'bg-[#1c5a35] text-white shadow-xs'
                : 'bg-white border border-[#cfcbb8] text-[#55665b] hover:bg-[#f1f6f0]'
            }`}
          >
            {t.filterGradeAHigh}
          </button>
          <button
            onClick={() => setFilterType('highURS')}
            className={`px-3.5 py-2 rounded-xl font-bold font-heading transition cursor-pointer shrink-0 ${
              filterType === 'highURS'
                ? 'bg-[#a93b2e] text-white shadow-xs'
                : 'bg-white border border-[#cfcbb8] text-[#55665b] hover:bg-[#f1f6f0]'
            }`}
          >
            {t.filterURS}
          </button>
        </div>
      </div>

      {/* Assessment Table & Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f1f6f0] text-[#55665b] flex items-center justify-center">
            <Layers className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-[#1c2a20] font-heading">
            No matching assessments found
          </p>
          <p className="text-xs text-[#55665b] max-w-sm mx-auto">
            Try adjusting your search criteria or conduct a new batch assessment.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#f7f5ee] text-[#55665b] font-bold uppercase tracking-wider text-[10px] border-b-2 border-[#cfcbb8]">
                  <th className="py-3 px-4">{t.reportIdLabel} / {t.batchId}</th>
                  <th className="py-3 px-4">{t.inspectionDate}</th>
                  <th className="py-3 px-4">{t.procurementCentreLabel}</th>
                  <th className="py-3 px-4">{t.onionVariety}</th>
                  <th className="py-3 px-4 text-center">{t.gradeA}</th>
                  <th className="py-3 px-4 text-center">{t.gradeURS}</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f6f0]">
                {filtered.map((record) => (
                  <tr 
                    key={record.reportId}
                    className="hover:bg-[#f1f6f0]/60 transition group"
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-[#174327]">{record.reportId}</div>
                      <div className="text-[11px] text-[#55665b]">{record.batch.batchId}</div>
                    </td>

                    <td className="py-3.5 px-4 text-[#55665b] whitespace-nowrap">
                      {record.batch.date}
                    </td>

                    <td className="py-3.5 px-4 text-[#1c2a20] font-medium max-w-[200px] truncate" title={record.batch.procurementCentre}>
                      {record.batch.procurementCentre}
                    </td>

                    <td className="py-3.5 px-4 text-[#1c2a20] font-heading font-bold">
                      {record.batch.onionVariety}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-[#1c5a35] bg-[#e0eee2] px-2 py-0.5 rounded-lg border border-[#bcd6c0]">
                        {record.gradeA}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-[#a93b2e] bg-[#f6e5e1] px-2 py-0.5 rounded-lg border border-[#e5c1ba]">
                        {record.gradeURS}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1c5a35] bg-[#e0eee2] px-2.5 py-0.5 rounded-full border border-[#bcd6c0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1c5a35]" />
                        {record.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectAssessment(record)}
                          className="px-2.5 py-1.5 text-[#1c2a20] bg-white hover:bg-[#f1f6f0] rounded-xl text-xs font-bold border border-[#cfcbb8] hover:border-[#1c5a35] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="View Digital Quality Report"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#1c5a35]" />
                          <span className="hidden sm:inline">{t.viewReport}</span>
                        </button>
                        <button
                          onClick={() => onDeleteAssessment(record.reportId)}
                          className="p-1.5 text-[#55665b] hover:text-[#a93b2e] hover:bg-[#f6e5e1] rounded-xl transition cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Clear Option */}
      {assessments.length > 0 && (
        <div className="flex justify-end pt-2">
          {showClearConfirm ? (
            <div className="flex items-center gap-2 p-2 bg-[#fef2f2] border border-[#fca5a5] rounded-xl text-xs">
              <span className="text-[#b91c1c] font-semibold">Clear all assessment records?</span>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="bg-[#b91c1c] text-white px-2.5 py-1 rounded-lg font-bold hover:bg-[#991b1b] cursor-pointer"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="bg-white text-[#55665b] border border-[#cfcbb8] px-2 py-1 rounded-lg hover:bg-[#f1f6f0] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-[#55665b] hover:text-[#a93b2e] flex items-center gap-1 transition cursor-pointer font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearAllHistory || "Clear All History"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
