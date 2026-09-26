import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Calendar, 
  Tag, 
  Scale, 
  ArrowRight, 
  AlertCircle, 
  ChevronLeft
} from 'lucide-react';
import { BatchData, Language } from '../types';
import { translations } from '../utils/translations';

interface CreateBatchProps {
  initialBatch?: BatchData;
  onSubmit: (batch: BatchData) => void;
  onCancel: () => void;
  language: Language;
}

const SAMPLE_CENTRES = [
  "Nashik APMC, Maharashtra",
  "Lasalgaon Mandi, Maharashtra",
  "Solapur Market Yard, Maharashtra",
  "Kurnool Mandi, Andhra Pradesh",
  "Alwar Mandi, Rajasthan",
  "Indore Mandi, Madhya Pradesh",
];

const SAMPLE_VARIETIES = [
  "Nashik Red",
  "Garwa (Late Kharif)",
  "Bhima Kiran (Rabi)",
  "Agrifound Dark Red",
  "Pusa Red",
  "White Onion",
];

export const CreateBatch: React.FC<CreateBatchProps> = ({
  initialBatch,
  onSubmit,
  onCancel,
  language,
}) => {
  const t = translations[language] || translations.en;
  const today = new Date().toISOString().split('T')[0];

  const [batchId, setBatchId] = useState(initialBatch?.batchId || `ONION-${Math.floor(1000 + Math.random() * 9000)}`);
  const [procurementCentre, setProcurementCentre] = useState(initialBatch?.procurementCentre || SAMPLE_CENTRES[0]);
  const [inspectorName, setInspectorName] = useState(initialBatch?.inspectorName || 'Inspector Officer');
  const [date, setDate] = useState(initialBatch?.date || today);
  const [onionVariety, setOnionVariety] = useState(initialBatch?.onionVariety || SAMPLE_VARIETIES[0]);
  const [approxQuantity, setApproxQuantity] = useState(initialBatch?.approxQuantity || '50 Quintals (500 Bags)');
  const [notes, setNotes] = useState(initialBatch?.notes || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId.trim() || !procurementCentre.trim()) {
      setError("Please fill in the Batch ID and Procurement Centre.");
      return;
    }
    setError(null);
    onSubmit({
      batchId: batchId.trim(),
      procurementCentre,
      inspectorName: inspectorName.trim() || 'Quality Officer',
      date,
      onionVariety,
      approxQuantity: approxQuantity.trim() || '50 Quintals',
      notes,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1c2a20] bg-white px-3.5 py-2 rounded-xl border border-[#cfcbb8] hover:bg-[#f1f6f0] transition-colors cursor-pointer shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t.dashboard}</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border-2 border-[#1c5a35]/25 shadow-xl overflow-hidden">
        {/* Step indicator banner */}
        <div className="bg-[#122e1d] text-[#f4f1e4] px-6 sm:px-8 py-5 border-b border-[#24462f]">
          <div className="text-[11px] font-extrabold text-[#f2c14e] uppercase tracking-wider font-heading">
            Consignment Setup
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-0.5 font-heading text-white">{t.createBatchTitle}</h2>
          <p className="text-xs text-[#a9bfa9] mt-1">{t.createBatchSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-[#f6e5e1] border border-[#e5c1ba] rounded-2xl text-[#a93b2e] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Batch ID */}
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
                {t.batchId} <span className="text-[#a93b2e]">*</span>
              </label>
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#cfcbb8] bg-[#f8faf8] text-sm font-mono font-bold text-[#1c2a20] focus:outline-none focus:border-[#1c5a35] focus:bg-white transition"
                required
              />
            </div>

            {/* Procurement Centre */}
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
                {t.procurementCentreLabel} <span className="text-[#a93b2e]">*</span>
              </label>
              <div className="relative">
                <select
                  value={procurementCentre}
                  onChange={(e) => setProcurementCentre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#cfcbb8] bg-[#f8faf8] text-sm text-[#1c2a20] focus:outline-none focus:border-[#1c5a35] focus:bg-white transition cursor-pointer"
                >
                  {SAMPLE_CENTRES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Building2 className="w-4 h-4 text-[#55665b] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Inspector Name */}
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
                {t.inspectorName}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  placeholder="e.g. Officer Name"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#cfcbb8] bg-[#f8faf8] text-sm text-[#1c2a20] focus:outline-none focus:border-[#1c5a35] focus:bg-white transition"
                />
                <User className="w-4 h-4 text-[#55665b] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Inspection Date */}
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
                {t.inspectionDate}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#cfcbb8] bg-[#f8faf8] text-sm text-[#1c2a20] focus:outline-none focus:border-[#1c5a35] focus:bg-white transition"
                />
                <Calendar className="w-4 h-4 text-[#55665b] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Onion Variety */}
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
                {t.onionVariety}
              </label>
              <div className="relative">
                <select
                  value={onionVariety}
                  onChange={(e) => setOnionVariety(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#cfcbb8] bg-[#f8faf8] text-sm text-[#1c2a20] focus:outline-none focus:border-[#1c5a35] focus:bg-white transition cursor-pointer"
                >
                  {SAMPLE_VARIETIES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <Tag className="w-4 h-4 text-[#55665b] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Approx Quantity */}
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] uppercase tracking-wider mb-1.5">
                {t.approxQuantity}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={approxQuantity}
                  onChange={(e) => setApproxQuantity(e.target.value)}
                  placeholder={t.quantityHint}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#cfcbb8] bg-[#f8faf8] text-sm text-[#1c2a20] focus:outline-none focus:border-[#1c5a35] focus:bg-white transition"
                />
                <Scale className="w-4 h-4 text-[#55665b] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e4e1d3] flex items-center justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#1c5a35] hover:bg-[#174327] text-white px-7 py-3 rounded-xl font-extrabold text-sm transition shadow-md cursor-pointer active:scale-95"
            >
              <span>{t.proceedToImage}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
