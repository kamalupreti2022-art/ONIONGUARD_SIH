/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ============================================================================
 * ONIONGUARD AI - MODEL CONFIGURATION
 * ============================================================================
 * You can configure the model URLs or relative paths here.
 * These can also be configured or overridden anytime in the Settings page in the UI.
 * 
 * MAIN_MODEL: Trained 8-class model (red/white healthy/rotten, single/bulk)
 * SPROUTED_MODEL: Dedicated model for detecting sprouted onions
 * DAMAGED_MODEL: Dedicated model for detecting damaged onions
 */

export const MAIN_MODEL = '/models/onion-quality/model.json';
export const SPROUTED_MODEL = '/models/sprouted-damaged/model.json';
export const DAMAGED_MODEL = '/models/sprouted-damaged/model.json';

// LocalStorage keys for browser overrides
export const STORAGE_MAIN_MODEL_KEY = 'onionguard_main_model_url';
export const STORAGE_SPROUTED_MODEL_KEY = 'onionguard_sprouted_model_url';
export const STORAGE_DAMAGED_MODEL_KEY = 'onionguard_damaged_model_url';

export function getConfiguredMainModelUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_MAIN_MODEL_KEY);
    if (saved && saved.trim()) return saved.trim();
  }
  return MAIN_MODEL;
}

export function getConfiguredSproutedModelUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_SPROUTED_MODEL_KEY);
    if (saved && saved.trim()) return saved.trim();
  }
  return SPROUTED_MODEL;
}

export function getConfiguredDamagedModelUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_DAMAGED_MODEL_KEY);
    if (saved && saved.trim()) return saved.trim();
  }
  return DAMAGED_MODEL;
}

export function setConfiguredModelUrls(urls: {
  mainModel?: string;
  sproutedModel?: string;
  damagedModel?: string;
}): void {
  if (typeof window !== 'undefined') {
    if (urls.mainModel !== undefined) {
      if (urls.mainModel.trim()) localStorage.setItem(STORAGE_MAIN_MODEL_KEY, urls.mainModel.trim());
      else localStorage.removeItem(STORAGE_MAIN_MODEL_KEY);
    }
    if (urls.sproutedModel !== undefined) {
      if (urls.sproutedModel.trim()) localStorage.setItem(STORAGE_SPROUTED_MODEL_KEY, urls.sproutedModel.trim());
      else localStorage.removeItem(STORAGE_SPROUTED_MODEL_KEY);
    }
    if (urls.damagedModel !== undefined) {
      if (urls.damagedModel.trim()) localStorage.setItem(STORAGE_DAMAGED_MODEL_KEY, urls.damagedModel.trim());
      else localStorage.removeItem(STORAGE_DAMAGED_MODEL_KEY);
    }
  }
}
