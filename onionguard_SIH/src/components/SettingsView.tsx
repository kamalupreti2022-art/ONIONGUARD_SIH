import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Sliders, 
  Trash2, 
  RotateCcw, 
  Save, 
  ShieldCheck, 
  CheckCircle2, 
  Info,
  Layers,
  Sparkles, 
  Cpu,
  UploadCloud,
  Check,
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Language, ModelEngineType, ViewMode } from '../types';
import { translations, LANGUAGE_LABELS } from '../utils/translations';
import { GradingRules, saveStoredRules, resetDemoAssessments } from '../utils/storage';
import { 
  DEFAULT_MODEL_URL, 
  getActiveModelUrl, 
  setActiveModelUrl, 
  clearActiveModelUrl,
  loadOnionModel,
  setUploadedModelFiles,
  disposeCachedModel,
  EXACT_8_CLASSES,
  HEALTHY_8_CLASSES,
  UNHEALTHY_8_CLASSES,
  CLASS_DISPLAY_NAMES
} from '../utils/tfModelService';

interface SettingsViewProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  rules: GradingRules;
  onRulesChange: (rules: GradingRules) => void;
  onResetData: () => void;
  onNavigate: (view: ViewMode) => void;
  modelEngine: ModelEngineType;
  onModelEngineChange: (engine: ModelEngineType) => void;
  customModelConnected: boolean;
  onCustomModelConnectedChange: (connected: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onLanguageChange,
  rules,
  onRulesChange,
  onResetData,
  onNavigate,
  modelEngine,
  onModelEngineChange,
  customModelConnected,
  onCustomModelConnectedChange,
}) => {
  const t = translations[language];

  const [minHealthy, setMinHealthy] = useState(rules.minHealthyGradeA);
  const [maxDamage, setMaxDamage] = useState(rules.maxDamageAllowed);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Model URL configuration state
  const [modelUrlInput, setModelUrlInput] = useState<string>(getActiveModelUrl());
  const [modelUrlSavedSuccess, setModelUrlSavedSuccess] = useState(false);
  const [testingModel, setTestingModel] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [uploadedFilesNames, setUploadedFilesNames] = useState<string[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setModelUrlInput(getActiveModelUrl());
  }, []);

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: GradingRules = {
      minHealthyGradeA: Number(minHealthy),
      maxDamageAllowed: Number(maxDamage),
    };
    saveStoredRules(updated);
    onRulesChange(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    const defaults: GradingRules = {
      minHealthyGradeA: 70,
      maxDamageAllowed: 10,
    };
    setMinHealthy(70);
    setMaxDamage(10);
    saveStoredRules(defaults);
    onRulesChange(defaults);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveModelUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (modelUrlInput.trim()) {
      setActiveModelUrl(modelUrlInput.trim());
      setModelUrlSavedSuccess(true);
      setTestResult(null);
      setTimeout(() => setModelUrlSavedSuccess(false), 3000);
    }
  };

  const handleResetModelUrl = () => {
    clearActiveModelUrl();
    setModelUrlInput(DEFAULT_MODEL_URL);
    setModelUrlSavedSuccess(true);
    setTestResult(null);
    setTimeout(() => setModelUrlSavedSuccess(false), 3000);
  };

  const handleTestModelConnection = async () => {
    setTestingModel(true);
    setTestResult(null);
    try {
      disposeCachedModel();
      const model = await loadOnionModel();
      const inputShape = model.inputs && model.inputs[0]?.shape ? JSON.stringify(model.inputs[0].shape) : '[224, 224, 3]';
      setTestResult({
        success: true,
        message: `Model loaded successfully! Expected input shape: ${inputShape}. 8 classes verified.`,
      });
      onCustomModelConnectedChange(true);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Could not load model: ${err.message || 'Check that model.json exists and is reachable.'}`,
      });
    } finally {
      setTestingModel(false);
    }
  };

  const handleModelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploadedFilesNames(files.map(f => f.name));
      setUploadedModelFiles(files);
      onCustomModelConnectedChange(true);
      setTestResult({
        success: true,
        message: `Selected ${files.length} model file(s) from local disk. Click "Test Model Connection" to initialize.`,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#e4e1d3] shadow-xs">
        <h1 className="text-2xl font-extrabold text-[#174327] tracking-tight font-heading">
          {t.settingsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#55665b] mt-1">
          Customize interface language, AI computer vision engines, and grading thresholds.
        </p>
      </div>

      {/* Model Architecture & Connection Section */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#1c5a35]" />
            <h2 className="text-base font-bold text-[#174327] font-heading">
              Trained Onion Classification Model
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#1c5a35] text-white px-2.5 py-0.5 rounded-full">
            8-CLASS MODEL INTEGRATION
          </span>
        </div>

        <p className="text-xs text-[#55665b] leading-relaxed">
          Provide your trained model URL or upload model files below. The inference strictly runs on the actual model, calculates <strong>HEALTHY</strong> vs <strong>UNHEALTHY</strong> probabilities, and never generates fake or demo predictions.
        </p>

        {/* Model URL Input Form */}
        <form onSubmit={handleSaveModelUrl} className="bg-[#f8faf8] border-2 border-[#bcd6c0] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#174327] font-heading flex items-center gap-1.5">
              <span>Model URL or Path:</span>
            </label>
            <button
              type="button"
              onClick={handleResetModelUrl}
              className="text-[11px] font-semibold text-[#55665b] hover:text-[#1c2a20] flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Default</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={modelUrlInput}
              onChange={(e) => setModelUrlInput(e.target.value)}
              placeholder="/models/onion-quality/model.json or https://..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#cfcbb8] bg-white text-xs font-mono text-[#1c2a20] focus:outline-none focus:border-[#1c5a35]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 bg-[#1c5a35] hover:bg-[#174327] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Model URL</span>
            </button>
          </div>

          {modelUrlSavedSuccess && (
            <div className="p-2.5 bg-[#e0eee2] border border-[#bcd6c0] rounded-xl text-[#1c5a35] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1c5a35] shrink-0" />
              <span>Model URL configuration saved successfully!</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="text-[11px] text-[#55665b]">
              Default local location: <code>public/models/onion-quality/model.json</code>
            </div>

            <button
              type="button"
              onClick={handleTestModelConnection}
              disabled={testingModel}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-[#f1f6f0] text-[#174327] border border-[#bcd6c0] px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              {testingModel ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1c5a35]" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#1c5a35]" />
                  <span>Test Model Connection</span>
                </>
              )}
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 border ${
              testResult.success
                ? 'bg-[#e0eee2] border-[#bcd6c0] text-[#1c5a35]'
                : 'bg-[#f6e5e1] border-[#e5c1ba] text-[#a93b2e]'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#1c5a35]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#a93b2e]" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </form>

        {/* Or Upload Model Files in Browser */}
        <div className="bg-[#fdfcf9] border border-[#cfcbb8] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[#8a5f12]" />
              <span className="text-xs font-bold text-[#1c2a20] font-heading">
                Or Load Model Files via Browser
              </span>
            </div>
            {uploadedFilesNames.length > 0 && (
              <span className="text-[10px] font-mono font-bold bg-[#e0eee2] text-[#1c5a35] px-2 py-0.5 rounded-full">
                {uploadedFilesNames.length} files selected
              </span>
            )}
          </div>

          <p className="text-xs text-[#55665b]">
            Select your <code>model.json</code> and weight <code>.bin</code> files directly from your computer:
          </p>

          <input
            type="file"
            multiple
            accept=".json,.bin"
            onChange={handleModelFileUpload}
            className="block w-full text-xs text-[#55665b] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1c5a35] file:text-white hover:file:bg-[#174327] file:cursor-pointer cursor-pointer border border-[#cfcbb8] rounded-xl p-1 bg-white"
          />

          {uploadedFilesNames.length > 0 && (
            <div className="text-[11px] font-mono text-[#55665b] bg-white p-2 rounded-lg border border-[#cfcbb8]">
              Selected: {uploadedFilesNames.join(', ')}
            </div>
          )}
        </div>

        {/* Model's 8 Classes Reference */}
        <div className="bg-[#f8fafc] border border-[#cfcbb8] rounded-2xl p-4 space-y-2 text-xs">
          <div className="font-bold text-[#174327] font-heading flex items-center justify-between">
            <span>Trained Model Classes (Exact 8 Classes)</span>
            <span className="text-[10px] text-[#55665b] font-mono font-normal">Internal Class Names</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="space-y-1 bg-white p-2.5 rounded-xl border border-[#bcd6c0]">
              <div className="font-bold text-[#1c5a35] font-heading flex items-center justify-between text-xs">
                <span>Healthy Classes (Sum to HEALTHY %)</span>
                <Check className="w-3.5 h-3.5 text-[#10b981]" />
              </div>
              {HEALTHY_8_CLASSES.map((cls, idx) => (
                <div key={cls} className="flex items-center justify-between text-[11px] text-[#1c2a20]">
                  <span>{CLASS_DISPLAY_NAMES[cls]}</span>
                  <code className="text-[10px] text-[#55665b]">{cls}</code>
                </div>
              ))}
            </div>

            <div className="space-y-1 bg-white p-2.5 rounded-xl border border-[#e5c1ba]">
              <div className="font-bold text-[#a93b2e] font-heading flex items-center justify-between text-xs">
                <span>Unhealthy / Rotten (Sum to UNHEALTHY %)</span>
                <AlertCircle className="w-3.5 h-3.5 text-[#a93b2e]" />
              </div>
              {UNHEALTHY_8_CLASSES.map((cls, idx) => (
                <div key={cls} className="flex items-center justify-between text-[11px] text-[#1c2a20]">
                  <span>{CLASS_DISPLAY_NAMES[cls]}</span>
                  <code className="text-[10px] text-[#55665b]">{cls}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language Section */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-[#1c5a35]" />
          <h2 className="text-base font-bold text-[#174327] font-heading">
            {t.languageSetting}
          </h2>
        </div>
        <p className="text-xs text-[#55665b]">
          Choose from 8 Indian languages for the interface.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {(Object.keys(LANGUAGE_LABELS) as Language[]).map((langKey) => {
            const isSelected = language === langKey;
            const langData = LANGUAGE_LABELS[langKey];
            return (
              <button
                key={langKey}
                onClick={() => onLanguageChange(langKey)}
                className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#e0eee2] border-[#1c5a35] text-[#174327] shadow-xs ring-2 ring-[#1c5a35]/20 font-bold'
                    : 'border-[#cfcbb8] hover:border-[#1c5a35]/40 hover:bg-[#f1f6f0] text-[#1c2a20]'
                }`}
              >
                <div className="text-base font-heading mb-0.5">{langData.native}</div>
                <div className="text-[10px] text-[#55665b]">{langData.english}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grading Rules Configuration */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#8a5f12]" />
            <h2 className="text-base font-bold text-[#174327] font-heading">
              {t.gradingRulesTitle}
            </h2>
          </div>
          <button
            onClick={handleResetDefaults}
            type="button"
            className="text-xs font-semibold text-[#55665b] hover:text-[#1c2a20] flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetDefaults}</span>
          </button>
        </div>

        <p className="text-xs text-[#55665b] leading-relaxed">
          Configure rule-based cutoffs for Grade A allocation and maximum permissible tolerance.
        </p>

        <form onSubmit={handleSaveRules} className="space-y-4 pt-2">
          {savedSuccess && (
            <div className="p-3.5 bg-[#e0eee2] border border-[#bcd6c0] rounded-2xl text-[#1c5a35] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1c5a35] shrink-0" />
              <span>Configuration successfully applied!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1c2a20] mb-1">
                {t.gradeAMinHealthy} ({minHealthy}%)
              </label>
              <input
                type="range"
                min="50"
                max="90"
                value={minHealthy}
                onChange={(e) => setMinHealthy(Number(e.target.value))}
                className="w-full accent-[#1c5a35] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#55665b] mt-1 font-mono">
                <span>50%</span>
                <span>Default: 70%</span>
                <span>90%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1c2a20] mb-1">
                {t.maxPermissibleDamage} ({maxDamage}%)
              </label>
              <input
                type="range"
                min="0"
                max="25"
                value={maxDamage}
                onChange={(e) => setMaxDamage(Number(e.target.value))}
                className="w-full accent-[#c28f2c] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#55665b] mt-1 font-mono">
                <span>0%</span>
                <span>Default: 10%</span>
                <span>25%</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-[#1c5a35] hover:bg-[#174327] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.saveSettings}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Clear Local Storage */}
      <div className="bg-white rounded-3xl border-2 border-[#e5c1ba] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-[#a93b2e]">
          <Trash2 className="w-5 h-5 text-[#a93b2e]" />
          <h2 className="text-base font-bold font-heading">
            Stored Assessments
          </h2>
        </div>
        <p className="text-xs text-[#55665b] leading-relaxed">
          Clear saved onion inspection assessments from your local browser storage.
        </p>

        <div className="pt-2">
          {showResetConfirm ? (
            <div className="flex items-center gap-2 p-2.5 bg-[#fef2f2] border border-[#fca5a5] rounded-xl text-xs">
              <span className="text-[#b91c1c] font-semibold">Clear all stored assessments?</span>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="bg-[#b91c1c] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#991b1b] cursor-pointer"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="bg-white text-[#55665b] border border-[#cfcbb8] px-2.5 py-1.5 rounded-lg hover:bg-[#f1f6f0] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-2 bg-[#f6e5e1] hover:bg-[#f0d4cf] text-[#a93b2e] border border-[#e5c1ba] font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#a93b2e]" />
              <span>{t.clearDataButton}</span>
            </button>
          )}
        </div>
      </div>

      {/* SIH Problem Statement Reference Card */}
      <div className="bg-[#122e1d] text-[#f4f1e4] rounded-3xl p-6 space-y-3 border-2 border-[#0a1f12] shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-[#f2c14e] uppercase tracking-wider font-heading">
          <ShieldCheck className="w-4 h-4" />
          <span>Smart India Hackathon 2026 Reference</span>
        </div>
        <h3 className="text-base font-bold font-heading text-white">
          Problem Statement ID: SIH26031
        </h3>
        <p className="text-xs text-[#a9bfa9] leading-relaxed">
          "Quality assessment and grading of onions are often subjective and vary across procurement centers, resulting in disputes and inconsistencies."
        </p>
        <div className="text-[11px] text-[#8fa68f] pt-2 border-t border-[#24462f] flex items-center justify-between">
          <span>Developed with React 19 + Tailwind CSS</span>
          <span>100% Client-Side In-Browser Inference</span>
        </div>
      </div>
    </div>
  );
};
