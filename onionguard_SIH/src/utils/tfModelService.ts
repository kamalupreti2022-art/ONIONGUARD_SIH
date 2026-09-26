/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as tf from '@tensorflow/tfjs';
import { 
  Class8ProbabilityItem, 
  MainQualityCategory, 
  MODEL_8_CLASSES, 
  OnionModel8Class 
} from '../types';

/**
 * ============================================================================
 * MODEL CONFIGURATION - PASTE / CONFIGURE YOUR MODEL URL HERE
 * ============================================================================
 * You can provide:
 * 1. A local path: '/models/onion-quality/model.json' (default bundled model)
 * 2. An external Teachable Machine URL:
 *    e.g. 'https://teachablemachine.withgoogle.com/models/0L5FnkzDX/'
 * 3. Any cloud-hosted model.json URL
 */
export const DEFAULT_MODEL_URL = '/models/onion-quality/model.json';
export const DEFAULT_LABELS_URL = '/models/onion-quality/labels.json';
export const DEFAULT_METADATA_URL = '/models/onion-quality/metadata.json';
export const HOSTED_TEACHABLE_MACHINE_URL = 'https://teachablemachine.withgoogle.com/models/0L5FnkzDX/';
export const HOSTED_STORAGE_URL = 'https://storage.googleapis.com/tm-model/0L5FnkzDX/model.json';

// Storage key for custom model URL configured via UI
export const STORAGE_MODEL_URL_KEY = 'onionguard_custom_model_url';

/**
 * Normalizes user-provided model URLs.
 * Handles Teachable Machine URLs with or without trailing slash and with or without model.json.
 */
export function normalizeModelUrl(rawUrl: string): { modelUrl: string; metadataUrl: string; baseUrl: string } {
  let url = (rawUrl || '').trim();
  if (!url) {
    url = DEFAULT_MODEL_URL;
  }

  // Remove trailing slashes
  url = url.replace(/\/+$/, '');

  // If already ends with .json
  if (url.endsWith('.json')) {
    const lastSlash = url.lastIndexOf('/');
    const baseUrl = lastSlash > 0 ? url.substring(0, lastSlash) : '';
    return {
      modelUrl: url,
      metadataUrl: baseUrl ? `${baseUrl}/metadata.json` : DEFAULT_METADATA_URL,
      baseUrl,
    };
  }

  // If it's a folder or Teachable Machine model URL, e.g.:
  // "https://teachablemachine.withgoogle.com/models/0L5FnkzDX"
  return {
    modelUrl: `${url}/model.json`,
    metadataUrl: `${url}/metadata.json`,
    baseUrl: url,
  };
}

export function getActiveModelUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_MODEL_URL_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  }
  return DEFAULT_MODEL_URL;
}

export function setActiveModelUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_MODEL_URL_KEY, url.trim());
  }
  disposeCachedModel();
}

export function clearActiveModelUrl(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_MODEL_URL_KEY);
  }
  disposeCachedModel();
}

/**
 * Exact 8 Classes required by the trained model:
 * Do not rename or modify these model class names internally.
 */
export const EXACT_8_CLASSES: readonly OnionModel8Class[] = MODEL_8_CLASSES;

export const HEALTHY_8_CLASSES: readonly OnionModel8Class[] = [
  'red healthy onions(single)',
  'white healthy onions(single)',
  'red healthy onions(bulk)',
  'white healthy onions(bulk)',
] as const;

export const UNHEALTHY_8_CLASSES: readonly OnionModel8Class[] = [
  'red rotten onions(single)',
  'white rotten onions(single)',
  'red rotten onions(bulk)',
  'white rotten onions(bulk)',
] as const;

/**
 * User-friendly display names for the 8 classes:
 */
export const CLASS_DISPLAY_NAMES: Record<OnionModel8Class, string> = {
  'red healthy onions(single)': 'Red Healthy — Single',
  'white healthy onions(single)': 'White Healthy — Single',
  'red healthy onions(bulk)': 'Red Healthy — Bulk',
  'white healthy onions(bulk)': 'White Healthy — Bulk',
  'red rotten onions(single)': 'Red Rotten — Single',
  'white rotten onions(single)': 'White Rotten — Single',
  'red rotten onions(bulk)': 'Red Rotten — Bulk',
  'white rotten onions(bulk)': 'White Rotten — Bulk',
};

export interface Tf8PredictionResult {
  mainCategory: MainQualityCategory; // 'HEALTHY' | 'UNHEALTHY'
  healthyPercentage: number;          // Sum of all 4 healthy classes %
  unhealthyPercentage: number;        // Sum of all 4 rotten/unhealthy classes %
  mainConfidencePercentage: number;   // Percentage of the winning main category
  class8Probabilities: Class8ProbabilityItem[];
  healthyClassDetails: Class8ProbabilityItem[];
  unhealthyClassDetails: Class8ProbabilityItem[];
  highestClass: {
    className: OnionModel8Class | string;
    displayName: string;
    percentage: number;
    probability: number;
    isHealthy: boolean;
  };
  qualityText: string;
  recommendationText: string;
  isLowConfidence: boolean;
  lowConfidenceWarning?: string;
  modelInputShape: number[];
  modelOutputShape: number[];
  rawProbabilities: number[];
  executionTimeMs: number;
}

export interface ModelLoadStatus {
  status: 'unloaded' | 'loading' | 'loaded' | 'error';
  errorMessage?: string;
  modelInputShape?: number[];
  labelsCount?: number;
  isAvailable: boolean;
  modelUrl: string;
}

// Internal model & labels cache
let cachedModel: tf.LayersModel | tf.GraphModel | null = null;
let cachedLabels: string[] = [...EXACT_8_CLASSES];
let loadPromise: Promise<tf.LayersModel | tf.GraphModel> | null = null;
let lastLoadStatus: ModelLoadStatus = {
  status: 'unloaded',
  isAvailable: false,
  modelUrl: DEFAULT_MODEL_URL,
};

// Support for browser-uploaded model files
let uploadedModelFiles: File[] | null = null;

export function setUploadedModelFiles(files: File[]): void {
  uploadedModelFiles = files;
  disposeCachedModel();
}

export function clearUploadedModelFiles(): void {
  uploadedModelFiles = null;
  disposeCachedModel();
}

/**
 * Checks whether the model files exist / are reachable
 */
export async function checkModelFilesAvailability(): Promise<boolean> {
  if (uploadedModelFiles && uploadedModelFiles.length > 0) {
    return true;
  }

  const { modelUrl } = normalizeModelUrl(getActiveModelUrl());

  try {
    const res = await fetch(modelUrl);
    if (res.ok) return true;
  } catch (err) {
    console.warn('[TensorFlow.js] Active model URL check notice:', err);
  }

  // Fallback check on bundled local model
  if (modelUrl !== DEFAULT_MODEL_URL) {
    try {
      const localRes = await fetch(DEFAULT_MODEL_URL);
      if (localRes.ok) return true;
    } catch {
      // ignore
    }
  }

  // Fallback check on hosted storage URL
  try {
    const hostedRes = await fetch(HOSTED_STORAGE_URL);
    if (hostedRes.ok) return true;
  } catch {
    // ignore
  }

  return false;
}

/**
 * Fetches the labels or metadata file
 */
export async function loadLabels(): Promise<string[]> {
  // If uploaded files include labels.json or metadata.json
  if (uploadedModelFiles) {
    const labelFile = uploadedModelFiles.find(f => 
      f.name.toLowerCase().endsWith('labels.json') || 
      f.name.toLowerCase().endsWith('metadata.json')
    );
    if (labelFile) {
      try {
        const text = await labelFile.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          cachedLabels = data.map(String);
          return cachedLabels;
        } else if (data && Array.isArray(data.labels)) {
          cachedLabels = data.labels.map(String);
          return cachedLabels;
        }
      } catch (e) {
        console.warn('Error reading uploaded labels file', e);
      }
    }
  }

  const { metadataUrl, baseUrl } = normalizeModelUrl(getActiveModelUrl());

  // 1. Try metadata.json from configured URL
  try {
    const res = await fetch(metadataUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.labels)) {
        cachedLabels = data.labels.map(String);
        console.info('[TensorFlow.js] Loaded labels from metadata.json:', cachedLabels);
        return cachedLabels;
      } else if (Array.isArray(data)) {
        cachedLabels = data.map(String);
        return cachedLabels;
      }
    }
  } catch (err) {
    console.warn('[TensorFlow.js] metadata.json fetch attempt:', err);
  }

  // 2. Try labels.json from configured base URL
  if (baseUrl) {
    try {
      const labelsRes = await fetch(`${baseUrl}/labels.json`);
      if (labelsRes.ok) {
        const data = await labelsRes.json();
        if (Array.isArray(data)) cachedLabels = data.map(String);
        else if (data && Array.isArray(data.labels)) cachedLabels = data.labels.map(String);
        return cachedLabels;
      }
    } catch {
      // ignore
    }
  }

  // 3. Try local bundled metadata.json or labels.json
  try {
    const localMetaRes = await fetch(DEFAULT_METADATA_URL);
    if (localMetaRes.ok) {
      const data = await localMetaRes.json();
      if (data && Array.isArray(data.labels)) {
        cachedLabels = data.labels.map(String);
        return cachedLabels;
      }
    }
  } catch {
    // ignore
  }

  try {
    const localLabelsRes = await fetch(DEFAULT_LABELS_URL);
    if (localLabelsRes.ok) {
      const data = await localLabelsRes.json();
      if (Array.isArray(data)) cachedLabels = data.map(String);
      else if (data && Array.isArray(data.labels)) cachedLabels = data.labels.map(String);
      return cachedLabels;
    }
  } catch {
    // ignore
  }

  cachedLabels = [...EXACT_8_CLASSES];
  return cachedLabels;
}

/**
 * Loads the real trained TensorFlow.js model
 */
export async function loadOnionModel(): Promise<tf.LayersModel | tf.GraphModel> {
  if (cachedModel) {
    return cachedModel;
  }

  if (loadPromise) {
    return loadPromise;
  }

  const rawUrl = getActiveModelUrl();
  const { modelUrl } = normalizeModelUrl(rawUrl);

  lastLoadStatus = {
    status: 'loading',
    isAvailable: false,
    modelUrl,
  };

  loadPromise = (async () => {
    try {
      await loadLabels();

      let model: tf.LayersModel | tf.GraphModel | null = null;

      if (uploadedModelFiles && uploadedModelFiles.length > 0) {
        console.info('[TensorFlow.js] Loading model from browser-uploaded files...');
        model = await tf.loadLayersModel(tf.io.browserFiles(uploadedModelFiles));
      } else {
        const candidateUrls = [
          modelUrl,
          DEFAULT_MODEL_URL,
          HOSTED_STORAGE_URL,
          'https://teachablemachine.withgoogle.com/models/0L5FnkzDX/model.json',
        ];

        // Deduplicate candidates preserving order
        const uniqueUrls = Array.from(new Set(candidateUrls));
        let lastError: any = null;

        for (const url of uniqueUrls) {
          try {
            console.info('[TensorFlow.js] Attempting to load model from:', url);
            model = await tf.loadLayersModel(url);
            if (model) {
              console.info('[TensorFlow.js] Successfully loaded model from:', url);
              break;
            }
          } catch (layersErr) {
            console.warn(`[TensorFlow.js] loadLayersModel error for ${url}:`, layersErr);
            try {
              model = await tf.loadGraphModel(url);
              if (model) {
                console.info('[TensorFlow.js] Successfully loaded graph model from:', url);
                break;
              }
            } catch (graphErr) {
              console.warn(`[TensorFlow.js] loadGraphModel error for ${url}:`, graphErr);
              lastError = layersErr;
            }
          }
        }

        if (!model && lastError) {
          throw lastError;
        }
      }

      if (!model) {
        throw new Error('Model could not be initialized.');
      }

      cachedModel = model;

      let inputShape: number[] = [224, 224, 3];
      if (model.inputs && model.inputs.length > 0 && model.inputs[0].shape) {
        inputShape = model.inputs[0].shape.filter((d): d is number => typeof d === 'number' && d > 0);
      }

      lastLoadStatus = {
        status: 'loaded',
        isAvailable: true,
        modelInputShape: inputShape,
        labelsCount: cachedLabels.length,
        modelUrl,
      };

      console.info('[TensorFlow.js] Model successfully loaded & verified. Input shape:', inputShape);
      return model;
    } catch (err: any) {
      console.error('[TensorFlow.js] Failed to load trained onion model:', err);
      cachedModel = null;
      lastLoadStatus = {
        status: 'error',
        isAvailable: false,
        errorMessage: 'AI model is not available. Please add the trained model files.',
        modelUrl,
      };
      throw new Error('AI model is not available. Please add the trained model files.');
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export function getModelStatus(): ModelLoadStatus {
  return lastLoadStatus;
}

/**
 * Preprocesses an image and runs model.predict() using the trained TensorFlow.js model.
 * Produces strictly real predictions with the 8 classes, summed into HEALTHY and UNHEALTHY.
 */
export async function predictWithTfModel(
  imageSource: HTMLImageElement | string,
  minConfidenceThreshold = 0.60
): Promise<Tf8PredictionResult> {
  const startTime = performance.now();

  // 1. Ensure real model is loaded
  const model = await loadOnionModel();
  const labels = await loadLabels();

  // 2. Load image element
  let imgElement: HTMLImageElement;
  if (typeof imageSource === 'string') {
    imgElement = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image for AI inference.'));
      img.src = imageSource;
    });
  } else {
    imgElement = imageSource;
  }

  // 3. Inspect expected input dimensions from model.inputs[0].shape (default 224x224)
  let targetWidth = 224;
  let targetHeight = 224;

  if (model.inputs && model.inputs[0] && model.inputs[0].shape) {
    const shape = model.inputs[0].shape;
    if (shape.length === 4) {
      if (typeof shape[1] === 'number' && shape[1] > 0) targetHeight = shape[1];
      if (typeof shape[2] === 'number' && shape[2] > 0) targetWidth = shape[2];
    }
  }

  // 4. Preprocess on an offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable for image preprocessing.');
  }

  ctx.drawImage(imgElement, 0, 0, targetWidth, targetHeight);

  // 5. Convert to tensor and apply MobileNet / Teachable Machine normalization:
  // (pixel / 127.5) - 1.0 (range [-1, 1])
  let rawProbs: number[] = [];
  const modelInputShape: number[] = [1, targetHeight, targetWidth, 3];
  let modelOutputShape: number[] = [];

  tf.tidy(() => {
    const imgTensor = tf.browser.fromPixels(canvas);
    // Standard MobileNet / Teachable Machine normalization: (x / 127.5) - 1.0
    const normalized = imgTensor.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1.0));
    const batched = normalized.expandDims(0);

    const outputTensor = model.predict(batched) as tf.Tensor;
    modelOutputShape = outputTensor.shape;

    const squeezed = outputTensor.squeeze();
    const data = Array.from(squeezed.dataSync());
    const sum = data.reduce((a, b) => a + b, 0);

    // Apply softmax if logits were returned (sum != 1)
    if (Math.abs(sum - 1.0) > 0.05) {
      const softmaxed = tf.softmax(squeezed);
      rawProbs = Array.from(softmaxed.dataSync());
    } else {
      rawProbs = data;
    }
  });

  const executionTimeMs = Math.round(performance.now() - startTime);

  // 6. Map predictions to the 8 exact classes
  const classProbMap = new Map<string, number>();

  labels.forEach((label, idx) => {
    const normalized = label.trim().toLowerCase();
    const prob = rawProbs[idx] !== undefined ? rawProbs[idx] : 0;
    classProbMap.set(normalized, prob);
  });

  // Ensure all 8 exact classes have probabilities
  EXACT_8_CLASSES.forEach((exactClass, idx) => {
    if (!classProbMap.has(exactClass)) {
      if (rawProbs[idx] !== undefined) {
        classProbMap.set(exactClass, rawProbs[idx]);
      } else {
        classProbMap.set(exactClass, 0);
      }
    }
  });

  // 7. Calculate HEALTHY % and UNHEALTHY %
  // Healthy classes:
  // - red healthy onions(single)
  // - white healthy onions(single)
  // - red healthy onions(bulk)
  // - white healthy onions(bulk)
  // Unhealthy classes:
  // - red rotten onions(single)
  // - white rotten onions(single)
  // - red rotten onions(bulk)
  // - white rotten onions(bulk)
  let healthyProbSum = 0;
  let unhealthyProbSum = 0;

  for (const hClass of HEALTHY_8_CLASSES) {
    healthyProbSum += classProbMap.get(hClass) || 0;
  }
  for (const uClass of UNHEALTHY_8_CLASSES) {
    unhealthyProbSum += classProbMap.get(uClass) || 0;
  }

  // Normalization so healthy % and unhealthy % sum to 100%
  const totalCombined = healthyProbSum + unhealthyProbSum;
  let normalizedHealthyProb = healthyProbSum;
  let normalizedUnhealthyProb = unhealthyProbSum;

  if (totalCombined > 0 && Math.abs(totalCombined - 1.0) > 0.001) {
    normalizedHealthyProb = healthyProbSum / totalCombined;
    normalizedUnhealthyProb = unhealthyProbSum / totalCombined;
  }

  const healthyPercentage = Math.round(normalizedHealthyProb * 100);
  const unhealthyPercentage = Math.round(100 - healthyPercentage);

  // 8. Determine main category: HEALTHY or UNHEALTHY
  const mainCategory: MainQualityCategory = 
    normalizedHealthyProb >= normalizedUnhealthyProb ? 'HEALTHY' : 'UNHEALTHY';

  const mainConfidencePercentage = mainCategory === 'HEALTHY' ? healthyPercentage : unhealthyPercentage;

  // 9. Prepare detailed 8 class items in exact order
  const healthyClassDetails: Class8ProbabilityItem[] = HEALTHY_8_CLASSES.map(cls => {
    const rawP = classProbMap.get(cls) || 0;
    const p = totalCombined > 0 ? (rawP / totalCombined) : rawP;
    return {
      className: cls,
      displayName: CLASS_DISPLAY_NAMES[cls],
      probability: rawP,
      percentage: Math.round(p * 100),
      isHealthyGroup: true,
    };
  });

  const unhealthyClassDetails: Class8ProbabilityItem[] = UNHEALTHY_8_CLASSES.map(cls => {
    const rawP = classProbMap.get(cls) || 0;
    const p = totalCombined > 0 ? (rawP / totalCombined) : rawP;
    return {
      className: cls,
      displayName: CLASS_DISPLAY_NAMES[cls],
      probability: rawP,
      percentage: Math.round(p * 100),
      isHealthyGroup: false,
    };
  });

  const all8Probabilities: Class8ProbabilityItem[] = [
    ...healthyClassDetails,
    ...unhealthyClassDetails,
  ];

  // Find the single highest individual class for transparent explanation
  let highestClassItem = all8Probabilities[0];
  for (const item of all8Probabilities) {
    if (item.probability > highestClassItem.probability) {
      highestClassItem = item;
    }
  }

  // 10. Low confidence rule
  const isLowConfidence = mainConfidencePercentage < (minConfidenceThreshold * 100);
  const lowConfidenceWarning = isLowConfidence
    ? 'Low confidence — please capture a clearer image of a single onion.'
    : undefined;

  const isHealthy = mainCategory === 'HEALTHY';
  const qualityText = isHealthy
    ? `Healthy produce (${healthyPercentage}% healthy indication). Dominant class: ${highestClassItem.displayName} (${highestClassItem.percentage}%).`
    : `Unhealthy produce detected (${unhealthyPercentage}% spoilage indication). Dominant class: ${highestClassItem.displayName} (${highestClassItem.percentage}%).`;

  const recommendationText = isHealthy
    ? 'Produce meets commercial quality standards. Suitable for normal storage, distribution, and market sale.'
    : 'Segregate this specimen from healthy stock immediately to prevent batch contamination. Inspect storage crate ventilation.';

  return {
    mainCategory,
    healthyPercentage,
    unhealthyPercentage,
    mainConfidencePercentage,
    class8Probabilities: all8Probabilities,
    healthyClassDetails,
    unhealthyClassDetails,
    highestClass: {
      className: highestClassItem.className,
      displayName: highestClassItem.displayName,
      percentage: highestClassItem.percentage,
      probability: highestClassItem.probability,
      isHealthy: highestClassItem.isHealthyGroup,
    },
    qualityText,
    recommendationText,
    isLowConfidence,
    lowConfidenceWarning,
    modelInputShape,
    modelOutputShape,
    rawProbabilities: rawProbs,
    executionTimeMs,
  };
}

/**
 * Clears cached model to free memory
 */
export function disposeCachedModel(): void {
  if (cachedModel) {
    try {
      cachedModel.dispose();
      console.info('[TensorFlow.js] Disposed cached model from memory.');
    } catch (err) {
      console.warn('[TensorFlow.js] Error disposing model:', err);
    }
    cachedModel = null;
  }
  loadPromise = null;
  lastLoadStatus = {
    status: 'unloaded',
    isAvailable: false,
    modelUrl: getActiveModelUrl(),
  };
}
