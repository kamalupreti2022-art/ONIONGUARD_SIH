import { AssessmentRecord, Language, ModelEngineType } from '../types';

const ASSESSMENTS_KEY = 'onionguard_assessments_v2';
const LANGUAGE_KEY = 'onionguard_lang_v2';
const GRADING_RULES_KEY = 'onionguard_grading_rules';
const MODEL_ENGINE_KEY = 'onionguard_model_engine';
const CUSTOM_MODEL_CONNECTED_KEY = 'onionguard_custom_model_connected';

export interface GradingRules {
  minHealthyGradeA: number; // default 70
  maxDamageAllowed: number; // default 10
}

export const DEFAULT_RULES: GradingRules = {
  minHealthyGradeA: 70,
  maxDamageAllowed: 10,
};

export function getStoredModelEngine(): ModelEngineType {
  try {
    const raw = localStorage.getItem(MODEL_ENGINE_KEY);
    return raw === 'direct_cv' ? 'direct_cv' : 'tfjs_local';
  } catch {
    return 'tfjs_local';
  }
}

export function saveStoredModelEngine(engine: ModelEngineType): void {
  try {
    localStorage.setItem(MODEL_ENGINE_KEY, engine);
  } catch {
    // ignore
  }
}

export function getStoredCustomModelConnected(): boolean {
  try {
    return localStorage.getItem(CUSTOM_MODEL_CONNECTED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveStoredCustomModelConnected(connected: boolean): void {
  try {
    localStorage.setItem(CUSTOM_MODEL_CONNECTED_KEY, connected ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function getStoredAssessments(): AssessmentRecord[] {
  try {
    const raw = localStorage.getItem(ASSESSMENTS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse assessments from localStorage', e);
    return [];
  }
}

export function saveAssessment(record: AssessmentRecord): void {
  try {
    const current = getStoredAssessments();
    // Prepend new record
    const updated = [record, ...current.filter(r => r.reportId !== record.reportId)];
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save assessment', e);
  }
}

export function deleteAssessment(reportId: string): AssessmentRecord[] {
  try {
    const current = getStoredAssessments();
    const updated = current.filter(r => r.reportId !== reportId);
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete assessment', e);
    return [];
  }
}

export function resetDemoAssessments(): AssessmentRecord[] {
  try {
    localStorage.removeItem(ASSESSMENTS_KEY);
    return [];
  } catch (e) {
    console.error('Failed to reset assessments', e);
    return [];
  }
}

const VALID_LANGUAGES: Language[] = ['en', 'hi', 'bn', 'mr', 'te', 'ta', 'kn', 'gu'];

export function getStoredLanguage(): Language {
  try {
    const lang = localStorage.getItem(LANGUAGE_KEY) as Language;
    if (lang && VALID_LANGUAGES.includes(lang)) {
      return lang;
    }
    return 'en';
  } catch {
    return 'en';
  }
}

export function saveStoredLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // ignore
  }
}

export function getStoredRules(): GradingRules {
  try {
    const raw = localStorage.getItem(GRADING_RULES_KEY);
    if (!raw) return DEFAULT_RULES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_RULES;
  }
}

export function saveStoredRules(rules: GradingRules): void {
  try {
    localStorage.setItem(GRADING_RULES_KEY, JSON.stringify(rules));
  } catch {
    // ignore
  }
}
