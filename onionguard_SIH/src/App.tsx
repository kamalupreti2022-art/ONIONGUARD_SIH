/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ViewMode, Language, BatchData, AssessmentRecord, ModelEngineType } from './types';
import { 
  getStoredAssessments, 
  saveAssessment, 
  deleteAssessment, 
  resetDemoAssessments, 
  getStoredLanguage, 
  saveStoredLanguage, 
  getStoredRules, 
  GradingRules,
  getStoredModelEngine,
  saveStoredModelEngine,
  getStoredCustomModelConnected,
  saveStoredCustomModelConnected
} from './utils/storage';
import { analyzeUploadedOnionImages, MultiScanResult } from './utils/imageScanner';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { CreateBatch } from './components/CreateBatch';
import { ImageUpload } from './components/ImageUpload';
import { AnalysisLoading } from './components/AnalysisLoading';
import { QualityAnalysis } from './components/QualityAnalysis';
import { DigitalReport } from './components/DigitalReport';
import { HistoryPage } from './components/HistoryPage';
import { ProcurementCentreDashboard } from './components/ProcurementCentreDashboard';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [language, setLanguage] = useState<Language>(getStoredLanguage());
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [rules, setRules] = useState<GradingRules>(getStoredRules());
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [modelEngine, setModelEngine] = useState<ModelEngineType>(getStoredModelEngine());
  const [customModelConnected, setCustomModelConnected] = useState<boolean>(getStoredCustomModelConnected());
  const [pendingScanResult, setPendingScanResult] = useState<MultiScanResult | null>(null);

  // Active batch creation workflow state (clean defaults, no demo text)
  const [activeBatch, setActiveBatch] = useState<BatchData>({
    batchId: `ONION-${Math.floor(1000 + Math.random() * 9000)}`,
    procurementCentre: 'Nashik APMC, Maharashtra',
    inspectorName: 'Quality Inspector',
    date: new Date().toISOString().split('T')[0],
    onionVariety: 'Nashik Red',
    approxQuantity: '50 Quintals (500 Bags)',
    notes: ''
  });

  const [activeImages, setActiveImages] = useState<string[]>([]);
  const [activeRecord, setActiveRecord] = useState<AssessmentRecord | null>(null);

  // Initialize stored assessments
  useEffect(() => {
    const loaded = getStoredAssessments();
    setAssessments(loaded);
    if (loaded.length > 0 && !activeRecord) {
      setActiveRecord(loaded[0]);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    saveStoredLanguage(lang);
  };

  const handleModelEngineChange = (engine: ModelEngineType) => {
    setModelEngine(engine);
    saveStoredModelEngine(engine);
  };

  const handleCustomModelConnectedChange = (connected: boolean) => {
    setCustomModelConnected(connected);
    saveStoredCustomModelConnected(connected);
  };

  // Batch Form Submit
  const handleBatchSubmit = (batch: BatchData) => {
    setActiveBatch(batch);
    setCurrentView('image-upload');
  };

  // Image Upload -> Start Real Trained AI Model Analysis
  const handleStartAnalysis = (images: string[]) => {
    setActiveImages(images);
    setCurrentView('analyzing');
    setPendingScanResult(null);

    // Genuinely analyze the uploaded image pixels using the trained AI model
    analyzeUploadedOnionImages(images, modelEngine, customModelConnected)
      .then((result) => {
        setPendingScanResult(result);
      })
      .catch((err) => {
        console.error("Image scan processing error", err);
        setPendingScanResult({
          totalAnalyzed: images.length,
          items: images.map((src, idx) => ({
            id: `err-${idx}`,
            imageIndex: idx + 1,
            imageSrc: src,
            prediction: 'unable_to_determine',
            mainCategory: 'unable_to_determine',
            label: 'Unable to determine',
            healthyPercentage: 0,
            unhealthyPercentage: 0,
            reason: 'Unable to perform reliable AI quality assessment because the trained onion model is not currently connected.',
            sizeReferenceDetected: false,
            bulbDetected: false
          })),
          counts: { healthy: 0, unhealthy: 0, damaged: 0, rotten: 0, sprouted: 0, other: 0, undersized: 0, unableToDetermine: images.length },
          percentages: { healthy: 0, unhealthy: 0, damaged: 0, rotten: 0, sprouted: 0, other: 0, undersized: 0, unableToDetermine: 100 },
          gradeA: 0,
          gradeURS: 0,
          qualitySummary: 'AI model is not available. Please add the trained model files.',
          boundingBoxes: [],
          modelAvailable: false,
          modelEngine: 'tfjs_local',
          modelNotice: 'AI model is not available. Please add the trained model files.'
        });
      });
  };

  // When AI Loading completes
  const handleAnalysisComplete = () => {
    if (pendingScanResult) {
      const newRecord: AssessmentRecord = {
        reportId: `REP-${activeBatch.batchId}-${Date.now().toString().slice(-4)}`,
        batch: activeBatch,
        timestamp: new Date().toISOString(),
        images: activeImages.length > 0 ? activeImages : [],
        imageItems: pendingScanResult.items,
        totalAnalyzed: pendingScanResult.totalAnalyzed,
        counts: pendingScanResult.counts,
        percentages: pendingScanResult.percentages,
        gradeA: pendingScanResult.gradeA,
        gradeURS: pendingScanResult.gradeURS,
        qualitySummary: pendingScanResult.qualitySummary,
        boundingBoxes: pendingScanResult.boundingBoxes,
        status: 'Completed',
        isDemoData: false,
        isRealScan: pendingScanResult.modelAvailable,
        modelEngineUsed: pendingScanResult.modelEngine,
        modelAvailable: pendingScanResult.modelAvailable,
        modelNotice: pendingScanResult.modelNotice,
      };

      saveAssessment(newRecord);
      setAssessments(getStoredAssessments());
      setActiveRecord(newRecord);
      setCurrentView('analysis-results');
      return;
    }

    // Fallback if still resolving
    analyzeUploadedOnionImages(activeImages.length > 0 ? activeImages : [], modelEngine, customModelConnected)
      .then((realResult) => {
        const newRecord: AssessmentRecord = {
          reportId: `REP-${activeBatch.batchId}-${Date.now().toString().slice(-4)}`,
          batch: activeBatch,
          timestamp: new Date().toISOString(),
          images: activeImages.length > 0 ? activeImages : [],
          imageItems: realResult.items,
          totalAnalyzed: realResult.totalAnalyzed,
          counts: realResult.counts,
          percentages: realResult.percentages,
          gradeA: realResult.gradeA,
          gradeURS: realResult.gradeURS,
          qualitySummary: realResult.qualitySummary,
          boundingBoxes: realResult.boundingBoxes,
          status: 'Completed',
          isDemoData: false,
          isRealScan: realResult.modelAvailable,
          modelEngineUsed: realResult.modelEngine,
          modelAvailable: realResult.modelAvailable,
          modelNotice: realResult.modelNotice,
        };

        saveAssessment(newRecord);
        setAssessments(getStoredAssessments());
        setActiveRecord(newRecord);
        setCurrentView('analysis-results');
      });
  };

  const handleSelectAssessment = (record: AssessmentRecord) => {
    setActiveRecord(record);
    setActiveBatch(record.batch);
    if (record.images && record.images.length > 0) {
      setActiveImages(record.images);
    }
  };

  const handleDeleteAssessment = (reportId: string) => {
    const updated = deleteAssessment(reportId);
    setAssessments(updated);
    if (activeRecord?.reportId === reportId) {
      setActiveRecord(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleResetData = () => {
    const updated = resetDemoAssessments();
    setAssessments(updated);
    setActiveRecord(null);
  };

  return (
    <div className="min-h-screen bg-[#f7f5ee] flex flex-col text-[#1c2a20] font-sans antialiased">
      {/* Top Header Navigation (Cleaned: Dashboard/History/Procurement removed from top bar) */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        language={language}
        onLanguageChange={handleLanguageChange}
        onToggleSidebarMobile={() => setSidebarMobileOpen(!sidebarMobileOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar (Desktop + Mobile drawer: Dashboard is accessible here) */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          language={language}
          isMobileOpen={sidebarMobileOpen}
          onCloseMobile={() => setSidebarMobileOpen(false)}
          activeBatch={activeBatch}
        />

        {/* Primary Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentView === 'landing' && (
            <LandingPage
              onNavigate={setCurrentView}
              language={language}
            />
          )}

          {currentView === 'dashboard' && (
            <Dashboard
              assessments={assessments}
              onNavigate={setCurrentView}
              onSelectAssessment={handleSelectAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              language={language}
            />
          )}

          {currentView === 'create-batch' && (
            <CreateBatch
              initialBatch={activeBatch}
              onSubmit={handleBatchSubmit}
              onCancel={() => setCurrentView('dashboard')}
              language={language}
            />
          )}

          {currentView === 'image-upload' && (
            <ImageUpload
              batch={activeBatch}
              onAnalyze={handleStartAnalysis}
              onBack={() => setCurrentView('create-batch')}
              language={language}
            />
          )}

          {currentView === 'analyzing' && (
            <AnalysisLoading
              onComplete={handleAnalysisComplete}
              language={language}
            />
          )}

          {currentView === 'analysis-results' && activeRecord && (
            <QualityAnalysis
              record={activeRecord}
              onGenerateReport={() => setCurrentView('report')}
              onReanalyze={() => setCurrentView('image-upload')}
              language={language}
            />
          )}

          {currentView === 'analysis-results' && !activeRecord && (
            <div className="p-8 text-center space-y-4 bg-white rounded-3xl border border-[#cfcbb8]">
              <p className="text-sm text-[#55665b]">No active assessment to display.</p>
              <button
                onClick={() => setCurrentView('image-upload')}
                className="bg-[#1c5a35] text-white px-5 py-2.5 rounded-xl font-bold text-xs"
              >
                Provide Onion Image
              </button>
            </div>
          )}

          {currentView === 'report' && activeRecord && (
            <DigitalReport
              record={activeRecord}
              onBackToDashboard={() => setCurrentView('dashboard')}
              language={language}
            />
          )}

          {currentView === 'report' && !activeRecord && (
            <div className="p-8 text-center space-y-4 bg-white rounded-3xl border border-[#cfcbb8]">
              <p className="text-sm text-[#55665b]">No report available.</p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="bg-[#1c5a35] text-white px-5 py-2.5 rounded-xl font-bold text-xs"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {currentView === 'history' && (
            <HistoryPage
              assessments={assessments}
              onSelectAssessment={handleSelectAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              onNavigate={setCurrentView}
              onClearAll={handleResetData}
              language={language}
            />
          )}

          {currentView === 'procurement-centre' && (
            <ProcurementCentreDashboard
              assessments={assessments}
              onSelectAssessment={handleSelectAssessment}
              onNavigate={setCurrentView}
              language={language}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              language={language}
              onLanguageChange={handleLanguageChange}
              rules={rules}
              onRulesChange={setRules}
              onResetData={handleResetData}
              onNavigate={setCurrentView}
              modelEngine={modelEngine}
              onModelEngineChange={handleModelEngineChange}
              customModelConnected={customModelConnected}
              onCustomModelConnectedChange={handleCustomModelConnectedChange}
            />
          )}
        </main>
      </div>

      {/* Footer (hidden in print) */}
      <footer className="no-print bg-[#ffffff] border-t border-[#cfcbb8] py-6 text-xs text-[#55665b] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-extrabold text-[#174327] font-heading">OnionGuard AI</span> — Automated Quality Assessment
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#55665b]">
            <span>Runs 100% locally in browser</span>
            <span>•</span>
            <span>8-Class Neural Network Classification</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        language={language}
      />
    </div>
  );
}
