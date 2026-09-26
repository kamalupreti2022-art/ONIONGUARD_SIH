/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Sliders, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Cpu,
  UploadCloud,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Layers,
  Check
} from 'lucide-react';
import { Language, ModelEngineType, ViewMode } from '../types';
import { translations, LANGUAGE_LABELS } from '../utils/translations';
import { GradingRules, saveStoredRules } from '../utils/storage';
import { 
  getConfiguredMainModelUrl, 
  getConfiguredSproutedModelUrl, 
  getConfiguredDamagedModelUrl,
  setConfiguredModelUrls,
  loadAllModels,
  checkAllModelsStatus,
  disposeCachedModels,
  setUploadedFilesForModel,
  DEFAULT_MODEL_URL,
  HEALTHY_8_CLASSES,
  ROTTEN_8_CLASSES,
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

  // 3 Models URL configuration state
  const [mainModelUrl, setMainModelUrl] = useState<string>(getConfiguredMainModelUrl());
  const [sproutedModelUrl, setSproutedModelUrl] = useState<string>(getConfiguredSproutedModelUrl());
  const [damagedModelUrl, setDamagedModelUrl] = useState<string>(getConfiguredDamagedModelUrl());
  const [modelsSavedSuccess, setModelsSavedSuccess] = useState(false);

  const [testingModels, setTestingModels] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  useEffect(() => {
    setMainModelUrl(getConfiguredMainModelUrl());
    setSproutedModelUrl(getConfiguredSproutedModelUrl());
    setDamagedModelUrl(getConfiguredDamagedModelUrl());
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

  const handleSaveModelUrls = (e: React.FormEvent) => {
    e.preventDefault();
    setConfiguredModelUrls({
      mainModel: mainModelUrl.trim(),
      sproutedModel: sproutedModelUrl.trim(),
      damagedModel: damagedModelUrl.trim(),
    });
    disposeCachedModels();
    setModelsSavedSuccess(true);
    setTestResult(null);
    setTimeout(() => setModelsSavedSuccess(false), 3000);
  };

  const handleResetModelUrls = () => {
    setMainModelUrl(DEFAULT_MODEL_URL);
    setSproutedModelUrl('');
    setDamagedModelUrl('');
    setConfiguredModelUrls({
      mainModel: DEFAULT_MODEL_URL,
      sproutedModel: '',
      damagedModel: '',
    });
    disposeCachedModels();
    setModelsSavedSuccess(true);
    setTestResult(null);
    setTimeout(() => setModelsSavedSuccess(false), 3000);
  };

  const handleTestAllModels = async () => {
    setTestingModels(true);
    setTestResult(null);
    try {
      disposeCachedModels();
      const status = await checkAllModelsStatus();
      if (status.isAllReady) {
        setTestResult({
          success: true,
          message: 'All 3 models loaded & verified successfully! (Main 8-Class + Sprouted + Damaged).',
          details: status,
        });
        onCustomModelConnectedChange(true);
      } else {
        setTestResult({
          success: false,
          message: status.errorMessage || 'One or more models failed to load. Please verify URLs.',
          details: status,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Error initializing neural network models.',
      });
    } finally {
      setTestingModels(false);
    }
  };

  const handleFileUpload = (type: 'main' | 'sprouted' | 'damaged', files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadedFilesForModel(type, Array.from(files));
    setTestResult({
      success: true,
      message: `Uploaded ${files.length} file(s) for ${type} model. Click "Test Connection for All 3 Models" to verify.`,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#e4e1d3] shadow-xs">
        <h1 className="text-2xl font-extrabold text-[#174327] tracking-tight font-heading">
          {t.settingsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#55665b] mt-1">
          Configure the 3 trained AI models (Main, Sprouted, Damaged), interface language, and grading parameters.
        </p>
      </div>

      {/* 3 AI MODELS CONFIGURATION SECTION */}
      <div className="bg-white rounded-3xl border-2 border-[#e4e1d3] p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#1c5a35]" />
            <h2 className="text-base font-bold text-[#174327] font-heading">
              Trained AI Models Configuration
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#1c5a35] text-white px-2.5 py-0.5 rounded-full uppercase">
            3-Model Suite
          </span>
        </div>

        <p className="text-xs text-[#55665b] leading-relaxed">
          Specify the actual URLs or relative paths for your trained neural networks. The system never invents predictions or uses demo data; all results reflect the real inference outputs of these models.
        </p>

        {/* Configuration Form for 3 Models */}
        <form onSubmit={handleSaveModelUrls} className="bg-[#f8faf8] border-2 border-[#bcd6c0] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#e0eee2] pb-2">
            <span className="text-xs font-extrabold text-[#174327] uppercase tracking-wider font-heading">
              Model Endpoint URLs
            </span>
            <button
              type="button"
              onClick={handleResetModelUrls}
              className="text-[11px] font-semibold text-[#55665b] hover:text-[#1c2a20] flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset URLs</span>
            </button>
          </div>

          {/* Model 1: MAIN_MODEL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#174327]">
                MAIN_MODEL <span className="text-[#55665b] font-normal text-[11px]">(8 Classes: Healthy & Rotten single/bulk)</span>
              </label>
              <span className="text-[10px] font-mono text-[#55665b]">Default: /models/onion-quality/model.json</span>
            </div>
            <input
              type="text"
              value={mainModelUrl}
              onChange={(e) => setMainModelUrl(e.target.value)}
              placeholder="/models/onion-quality/model.json or https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfcbb8] bg-white text-xs font-mono text-[#1c2a20] focus:outline-none focus:border-[#1c5a35]"
            />
          </div>

          {/* Model 2: SPROUTED_MODEL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#854d0e]">
                SPROUTED_MODEL <span className="text-[#55665b] font-normal text-[11px]">(Dedicated Sprouted Detection Model)</span>
              </label>
              <label className="text-[10px] text-[#1c5a35] hover:underline cursor-pointer flex items-center gap-1">
                <UploadCloud className="w-3 h-3" />
                <span>Upload files</span>
                <input
                  type="file"
                  multiple
                  accept=".json,.bin"
                  onChange={(e) => handleFileUpload('sprouted', e.target.files)}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={sproutedModelUrl}
              onChange={(e) => setSproutedModelUrl(e.target.value)}
              placeholder="e.g. https://teachablemachine.withgoogle.com/models/YOUR_ID/ or /models/sprouted/model.json"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfcbb8] bg-white text-xs font-mono text-[#1c2a20] focus:outline-none focus:border-[#1c5a35]"
            />
          </div>

          {/* Model 3: DAMAGED_MODEL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#c2410c]">
                DAMAGED_MODEL <span className="text-[#55665b] font-normal text-[11px]">(Dedicated Damaged Detection Model)</span>
              </label>
              <label className="text-[10px] text-[#1c5a35] hover:underline cursor-pointer flex items-center gap-1">
                <UploadCloud className="w-3 h-3" />
                <span>Upload files</span>
                <input
                  type="file"
                  multiple
                  accept=".json,.bin"
                  onChange={(e) => handleFileUpload('damaged', e.target.files)}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={damagedModelUrl}
              onChange={(e) => setDamagedModelUrl(e.target.value)}
              placeholder="e.g. https://teachablemachine.withgoogle.com/models/YOUR_ID/ or /models/damaged/model.json"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfcbb8] bg-white text-xs font-mono text-[#1c2a20] focus:outline-none focus:border-[#1c5a35]"
            />
          </div>

          {modelsSavedSuccess && (
            <div className="p-2.5 bg-[#e0eee2] border border-[#bcd6c0] rounded-xl text-[#1c5a35] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1c5a35] shrink-0" />
              <span>Model URLs updated and cached in browser storage!</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#e0eee2]">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-[#1c5a35] hover:bg-[#174327] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Model URLs</span>
            </button>

            <button
              type="button"
              onClick={handleTestAllModels}
              disabled={testingModels}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-[#f1f6f0] text-[#174327] border border-[#bcd6c0] px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              {testingModels ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1c5a35]" />
                  <span>Testing All Models...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#1c5a35]" />
                  <span>Test Connection for All 3 Models</span>
                </>
              )}
            </button>
          </div>

          {testResult && (
            <div className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 border ${
              testResult.success
                ? 'bg-[#e0eee2] border-[#bcd6c0] text-[#1c5a35]'
                : 'bg-[#f6e5e1] border-[#e5c1ba] text-[#a93b2e]'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#1c5a35]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#a93b2e]" />
              )}
              <div className="flex-1 space-y-1">
                <span className="font-bold block">{testResult.message}</span>
                {testResult.details && (
                  <div className="text-[11px] font-mono text-[#55665b] space-y-0.5 pt-1">
                    <div>Main Model: {testResult.details.mainModel?.loaded ? '✅ Ready' : '❌ Failed'}</div>
                    <div>Sprouted Model: {testResult.details.sproutedModel?.loaded ? '✅ Ready' : '❌ Missing/Unreachable'}</div>
                    <div>Damaged Model: {testResult.details.damagedModel?.loaded ? '✅ Ready' : '❌ Missing/Unreachable'}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>

        {/* 10 Classes Reference */}
        <div className="bg-[#f8fafc] border border-[#cfcbb8] rounded-2xl p-4 space-y-2 text-xs">
          <div className="font-bold text-[#174327] font-heading flex items-center justify-between">
            <span>Detailed Detection Architecture (10 Detections)</span>
            <span className="text-[10px] text-[#55665b] font-mono font-normal">8 Main + Sprouted + Damaged</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="space-y-1 bg-white p-2.5 rounded-xl border border-[#bcd6c0]">
              <div className="font-bold text-[#1c5a35] font-heading flex items-center justify-between text-xs">
                <span>Healthy Classes (Main Model)</span>
                <Check className="w-3.5 h-3.5 text-[#10b981]" />
              </div>
              {HEALTHY_8_CLASSES.map((cls) => (
                <div key={cls} className="flex items-center justify-between text-[11px] text-[#1c2a20]">
                  <span>{CLASS_DISPLAY_NAMES[cls]}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 bg-white p-2.5 rounded-xl border border-[#e5c1ba]">
              <div className="font-bold text-[#a93b2e] font-heading flex items-center justify-between text-xs">
                <span>Rotten Classes (Main Model)</span>
                <AlertCircle className="w-3.5 h-3.5 text-[#a93b2e]" />
              </div>
              {ROTTEN_8_CLASSES.map((cls) => (
                <div key={cls} className="flex items-center justify-between text-[11px] text-[#1c2a20]">
                  <span>{CLASS_DISPLAY_NAMES[cls]}</span>
                </div>
              ))}
            </div>

            <div className="sm:col-span-2 bg-white p-2.5 rounded-xl border border-[#fde68a] flex items-center justify-between text-xs">
              <span className="font-bold text-[#854d0e]">Additional AI Detections:</span>
              <span className="font-semibold text-[#1c2a20]">9. Sprouted (Apical vegetative shoot) • 10. Damaged (Mechanical tunic laceration)</span>
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
              <span>{t.saveSettings}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
