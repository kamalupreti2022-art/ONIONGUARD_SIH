/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as tf from '@tensorflow/tfjs';
import { 
  DetailedDetectionItem, 
  MainQualityCategory, 
  MODEL_8_CLASSES, 
  OnionModel8Class 
} from '../types';
import { 
  getConfiguredMainModelUrl, 
  getConfiguredSproutedModelUrl, 
  getConfiguredDamagedModelUrl,
  MAIN_MODEL,
  SPROUTED_MODEL,
  DAMAGED_MODEL,
  setConfiguredModelUrls
} from '../config/models';

export {
  getConfiguredMainModelUrl,
  getConfiguredSproutedModelUrl,
  getConfiguredDamagedModelUrl,
  setConfiguredModelUrls
};

export const DEFAULT_MODEL_URL = MAIN_MODEL;
export const DEFAULT_LABELS_URL = '/models/onion-quality/labels.json';
export const DEFAULT_METADATA_URL = '/models/onion-quality/metadata.json';

export const EXACT_8_CLASSES: readonly OnionModel8Class[] = MODEL_8_CLASSES;

export const HEALTHY_8_CLASSES: readonly OnionModel8Class[] = [
  'red healthy onions(single)',
  'white healthy onions(single)',
  'red healthy onions(bulk)',
  'white healthy onions(bulk)',
] as const;

export const ROTTEN_8_CLASSES: readonly OnionModel8Class[] = [
  'red rotten onions(single)',
  'white rotten onions(single)',
  'red rotten onions(bulk)',
  'white rotten onions(bulk)',
] as const;

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

// Convert RGB to HSV [0-360, 0-1, 0-1]
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s, v];
}

export function normalizeModelUrl(rawUrl: string): { modelUrl: string; metadataUrl: string; baseUrl: string } {
  let url = (rawUrl || '').trim();
  if (!url) {
    return { modelUrl: '', metadataUrl: '', baseUrl: '' };
  }

  url = url.replace(/\/+$/, '');

  if (url.endsWith('.json')) {
    const lastSlash = url.lastIndexOf('/');
    const baseUrl = lastSlash > 0 ? url.substring(0, lastSlash) : '';
    return {
      modelUrl: url,
      metadataUrl: baseUrl ? `${baseUrl}/metadata.json` : `${url.replace(/model\.json$/, '')}metadata.json`,
      baseUrl,
    };
  }

  return {
    modelUrl: `${url}/model.json`,
    metadataUrl: `${url}/metadata.json`,
    baseUrl: url,
  };
}

export interface SingleImageInferenceResult {
  mainCategory: MainQualityCategory; // 'HEALTHY' | 'ROTTEN' | 'SPROUTED'
  healthyPercentage: number;
  rottenPercentage: number;
  sproutedPercentage: number;
  damagedPercentage: number;
  confidence: number;
  detailedDetections: DetailedDetectionItem[]; // 10 classes
  qualityText: string;
  recommendationText: string;
  executionTimeMs: number;
}

export interface MultiModelLoadStatus {
  mainModel: { loaded: boolean; url: string; error?: string; labels?: string[]; shape?: number[] };
  sproutedModel: { loaded: boolean; url: string; error?: string; labels?: string[]; shape?: number[] };
  damagedModel: { loaded: boolean; url: string; error?: string; labels?: string[]; shape?: number[] };
  isAllReady: boolean;
  errorMessage?: string;
}

interface ModelCacheEntry {
  model: tf.LayersModel | tf.GraphModel;
  labels: string[];
  url: string;
  inputShape: number[];
}

let cachedMain: ModelCacheEntry | null = null;
let cachedSprouted: ModelCacheEntry | null = null;
let cachedDamaged: ModelCacheEntry | null = null;

let uploadedFilesMap: {
  main?: File[];
  sprouted?: File[];
  damaged?: File[];
} = {};

export function setUploadedFilesForModel(modelType: 'main' | 'sprouted' | 'damaged', files: File[]): void {
  uploadedFilesMap[modelType] = files;
  disposeCachedModels();
}

export function clearUploadedFiles(): void {
  uploadedFilesMap = {};
  disposeCachedModels();
}

async function loadLabelsForUrl(normalized: { metadataUrl: string; baseUrl: string }, uploadedFiles?: File[]): Promise<string[]> {
  if (uploadedFiles && uploadedFiles.length > 0) {
    const metaFile = uploadedFiles.find(f => 
      f.name.toLowerCase().endsWith('metadata.json') || f.name.toLowerCase().endsWith('labels.json')
    );
    if (metaFile) {
      try {
        const text = await metaFile.text();
        const data = JSON.parse(text);
        if (Array.isArray(data.labels)) return data.labels.map(String);
        if (Array.isArray(data)) return data.map(String);
      } catch (e) {
        console.warn('Error reading uploaded metadata file', e);
      }
    }
  }

  if (normalized.metadataUrl) {
    try {
      const res = await fetch(normalized.metadataUrl);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.labels)) return data.labels.map(String);
        if (Array.isArray(data)) return data.map(String);
      }
    } catch {
      // ignore
    }
  }

  return [];
}

async function loadSingleModel(
  rawUrl: string, 
  uploadedFiles?: File[], 
  defaultLabels: string[] = []
): Promise<ModelCacheEntry> {
  const normalized = normalizeModelUrl(rawUrl || DEFAULT_MODEL_URL);
  let loadedLabels = await loadLabelsForUrl(normalized, uploadedFiles);
  if (loadedLabels.length === 0) {
    loadedLabels = defaultLabels;
  }

  let model: tf.LayersModel | tf.GraphModel | null = null;

  if (uploadedFiles && uploadedFiles.length > 0) {
    model = await tf.loadLayersModel(tf.io.browserFiles(uploadedFiles));
  } else {
    try {
      model = await tf.loadLayersModel(normalized.modelUrl);
    } catch (layersErr) {
      try {
        model = await tf.loadGraphModel(normalized.modelUrl);
      } catch (graphErr) {
        // Fallback to bundled model if custom URL fails
        if (normalized.modelUrl !== DEFAULT_MODEL_URL) {
          model = await tf.loadLayersModel(DEFAULT_MODEL_URL);
        } else {
          throw new Error(`Failed to load model from ${normalized.modelUrl}`);
        }
      }
    }
  }

  if (!model) {
    throw new Error(`Model could not be initialized from ${rawUrl}`);
  }

  let inputShape = [224, 224, 3];
  if (model.inputs && model.inputs[0]?.shape) {
    const s = model.inputs[0].shape.filter((d): d is number => typeof d === 'number' && d > 0);
    if (s.length >= 2) inputShape = s;
  }

  return {
    model,
    labels: loadedLabels,
    url: rawUrl,
    inputShape,
  };
}

export async function loadMainModel(): Promise<ModelCacheEntry> {
  const mainUrl = getConfiguredMainModelUrl() || DEFAULT_MODEL_URL;
  if (!cachedMain || cachedMain.url !== mainUrl) {
    cachedMain = await loadSingleModel(mainUrl, uploadedFilesMap.main, [...EXACT_8_CLASSES]);
  }
  return cachedMain;
}

export async function checkAllModelsStatus(): Promise<MultiModelLoadStatus> {
  const mainUrl = getConfiguredMainModelUrl() || DEFAULT_MODEL_URL;
  const sproutedUrl = getConfiguredSproutedModelUrl();
  const damagedUrl = getConfiguredDamagedModelUrl();

  const status: MultiModelLoadStatus = {
    mainModel: { loaded: false, url: mainUrl },
    sproutedModel: { loaded: Boolean(sproutedUrl), url: sproutedUrl || 'Integrated Prototype Detector' },
    damagedModel: { loaded: Boolean(damagedUrl), url: damagedUrl || 'Integrated Prototype Detector' },
    isAllReady: true,
  };

  try {
    const main = await loadMainModel();
    status.mainModel = {
      loaded: true,
      url: mainUrl,
      labels: main.labels,
      shape: main.inputShape,
    };
    status.isAllReady = true;
  } catch (err: any) {
    status.mainModel.error = err.message || 'Main model failed to load';
    status.isAllReady = false;
  }

  return status;
}

async function runInferenceOnImage(
  modelEntry: ModelCacheEntry, 
  canvas: HTMLCanvasElement
): Promise<number[]> {
  const model = modelEntry.model;
  let targetWidth = 224;
  let targetHeight = 224;

  if (model.inputs && model.inputs[0]?.shape) {
    const shape = model.inputs[0].shape;
    if (shape.length === 4) {
      if (typeof shape[1] === 'number' && shape[1] > 0) targetHeight = shape[1];
      if (typeof shape[2] === 'number' && shape[2] > 0) targetWidth = shape[2];
    }
  }

  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = targetWidth;
  scaledCanvas.height = targetHeight;
  const ctx = scaledCanvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');
  ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

  let rawProbs: number[] = [];

  tf.tidy(() => {
    const imgTensor = tf.browser.fromPixels(scaledCanvas);
    const normalized = imgTensor.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1.0));
    const batched = normalized.expandDims(0);

    const outputTensor = model.predict(batched) as tf.Tensor;
    const squeezed = outputTensor.squeeze();
    const data = Array.from(squeezed.dataSync());
    const sum = data.reduce((a, b) => a + b, 0);

    if (Math.abs(sum - 1.0) > 0.05) {
      const softmaxed = tf.softmax(squeezed);
      rawProbs = Array.from(softmaxed.dataSync());
    } else {
      rawProbs = data;
    }
  });

  return rawProbs;
}

/**
 * Predicts quality for a single onion photo across all 10 classes:
 * - Runs the trained 8-class model using TensorFlow.js
 * - Runs custom Sprouted/Damaged models if configured, or evaluates the photo's vegetative shoot & mechanical damage profiles
 * - Outputs 3 main categories: HEALTHY, ROTTEN, SPROUTED (No UNHEALTHY!)
 * - Outputs all 10 detailed detections
 */
export async function predictSingleOnionPhoto(
  imageSource: HTMLImageElement | string
): Promise<SingleImageInferenceResult> {
  const startTime = performance.now();

  // 1. Load Main Model
  const main = await loadMainModel();

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

  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = imgElement.naturalWidth || imgElement.width || 400;
  baseCanvas.height = imgElement.naturalHeight || imgElement.height || 400;
  const baseCtx = baseCanvas.getContext('2d', { willReadFrequently: true });
  if (!baseCtx) throw new Error('Canvas 2D context unavailable.');
  baseCtx.drawImage(imgElement, 0, 0);

  // 3. Run Main Model (8 Classes)
  const mainProbs = await runInferenceOnImage(main, baseCanvas);
  const mainClassMap = new Map<string, number>();

  main.labels.forEach((label, idx) => {
    const key = label.trim().toLowerCase();
    mainClassMap.set(key, mainProbs[idx] ?? 0);
  });

  EXACT_8_CLASSES.forEach((cls, idx) => {
    if (!mainClassMap.has(cls)) {
      mainClassMap.set(cls, mainProbs[idx] ?? 0);
    }
  });

  let healthyProbSum = 0;
  for (const hClass of HEALTHY_8_CLASSES) {
    healthyProbSum += mainClassMap.get(hClass) || 0;
  }

  let rottenProbSum = 0;
  for (const rClass of ROTTEN_8_CLASSES) {
    rottenProbSum += mainClassMap.get(rClass) || 0;
  }

  // 4. Sprouted & Damaged Detection:
  // If custom models configured, use them. Otherwise, evaluate directly from the photo's pixel characteristics!
  let sproutedProb = 0;
  let damagedProb = 0;

  const sproutedUrl = getConfiguredSproutedModelUrl();
  const damagedUrl = getConfiguredDamagedModelUrl();

  if (sproutedUrl) {
    try {
      if (!cachedSprouted || cachedSprouted.url !== sproutedUrl) {
        cachedSprouted = await loadSingleModel(sproutedUrl, uploadedFilesMap.sprouted, ['sprouted', 'healthy']);
      }
      const p = await runInferenceOnImage(cachedSprouted, baseCanvas);
      const sIdx = cachedSprouted.labels.findIndex(l => l.toLowerCase().includes('sprout'));
      sproutedProb = sIdx >= 0 ? p[sIdx] : p[0];
    } catch (e) {
      console.warn('Sprouted model URL execution notice:', e);
    }
  }

  if (damagedUrl) {
    try {
      if (!cachedDamaged || cachedDamaged.url !== damagedUrl) {
        cachedDamaged = await loadSingleModel(damagedUrl, uploadedFilesMap.damaged, ['damaged', 'healthy']);
      }
      const p = await runInferenceOnImage(cachedDamaged, baseCanvas);
      const dIdx = cachedDamaged.labels.findIndex(l => l.toLowerCase().includes('damage'));
      damagedProb = dIdx >= 0 ? p[dIdx] : (p.length > 1 ? p[1] : p[0]);
    } catch (e) {
      console.warn('Damaged model URL execution notice:', e);
    }
  }

  // If no external model URL provided, compute from the image's physical onion features
  if (!sproutedUrl || !damagedUrl) {
    const imgData = baseCtx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
    const data = imgData.data;
    let onionPix = 0;
    let greenPix = 0;
    let cutPix = 0;

    for (let i = 0; i < data.length; i += 8) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 20) continue;
      const [h, s, v] = rgbToHsv(r, g, b);
      const isOnion = (h < 40 || h > 315 || (h >= 20 && h <= 55)) && s > 0.14 && v > 0.14;
      if (isOnion) {
        onionPix++;
        if (h >= 65 && h <= 160 && s > 0.22 && v > 0.18) greenPix++;
        if (h >= 42 && h <= 64 && s > 0.38 && v > 0.38) cutPix++;
      }
    }

    if (onionPix > 0) {
      const greenRatio = greenPix / onionPix;
      const cutRatio = cutPix / onionPix;
      if (!sproutedUrl) {
        sproutedProb = Math.min(0.98, greenRatio * 15);
      }
      if (!damagedUrl) {
        damagedProb = Math.min(0.95, cutRatio * 12);
      }
    }
  }

  // Calculate percentages
  const healthyPct = Math.round(Math.min(1, Math.max(0, healthyProbSum)) * 100);
  const rottenPct = Math.round(Math.min(1, Math.max(0, rottenProbSum)) * 100);
  const sproutedPct = Math.round(Math.min(1, Math.max(0, sproutedProb)) * 100);
  const damagedPct = Math.round(Math.min(1, Math.max(0, damagedProb)) * 100);

  // 10 Detailed Detections:
  // 1-8 Main Model classes + 9 Sprouted + 10 Damaged = 10 classes
  const detailedDetections: DetailedDetectionItem[] = [
    ...HEALTHY_8_CLASSES.map(cls => ({
      key: cls,
      className: cls,
      displayName: CLASS_DISPLAY_NAMES[cls],
      probability: mainClassMap.get(cls) || 0,
      percentage: Math.round((mainClassMap.get(cls) || 0) * 100),
      category: 'HEALTHY' as const,
      sourceModel: 'main' as const,
    })),
    ...ROTTEN_8_CLASSES.map(cls => ({
      key: cls,
      className: cls,
      displayName: CLASS_DISPLAY_NAMES[cls],
      probability: mainClassMap.get(cls) || 0,
      percentage: Math.round((mainClassMap.get(cls) || 0) * 100),
      category: 'ROTTEN' as const,
      sourceModel: 'main' as const,
    })),
    {
      key: 'sprouted',
      className: 'sprouted',
      displayName: 'Sprouted (Vegetative Shoot)',
      probability: sproutedProb,
      percentage: sproutedPct,
      category: 'SPROUTED' as const,
      sourceModel: 'sprouted' as const,
    },
    {
      key: 'damaged',
      className: 'damaged',
      displayName: 'Damaged (Mechanical / Cut)',
      probability: damagedProb,
      percentage: damagedPct,
      category: 'DAMAGED' as const,
      sourceModel: 'damaged' as const,
    },
  ];

  // Determine main category: HEALTHY, ROTTEN, SPROUTED (NO UNHEALTHY!)
  let mainCategory: MainQualityCategory = 'HEALTHY';
  let winningPct = healthyPct;

  if (sproutedPct >= 45 && sproutedPct > healthyPct && sproutedPct >= rottenPct) {
    mainCategory = 'SPROUTED';
    winningPct = sproutedPct;
  } else if (rottenPct > healthyPct && rottenPct >= sproutedPct) {
    mainCategory = 'ROTTEN';
    winningPct = rottenPct;
  } else {
    mainCategory = 'HEALTHY';
    winningPct = healthyPct;
  }

  const executionTimeMs = Math.round(performance.now() - startTime);

  let qualityText = '';
  let recommendationText = '';

  if (mainCategory === 'HEALTHY') {
    qualityText = `Sound commercial quality (${healthyPct}% healthy indication). Low incidence of rot (${rottenPct}%) and sprout (${sproutedPct}%).`;
    recommendationText = 'Produce meets commercial quality standards. Suitable for distribution, crate stacking, and market sale.';
  } else if (mainCategory === 'ROTTEN') {
    qualityText = `Rotten/decayed produce detected (${rottenPct}% rot indication). High risk of fungal decay spreading in batch.`;
    recommendationText = 'Immediate segregation recommended to prevent spread of bacterial/fungal rot in crate.';
  } else {
    qualityText = `Sprouted onion detected (${sproutedPct}% sprout indication). Vegetative shooting reduces market shelf life.`;
    recommendationText = 'Segregate sprouted bulbs. Prioritize for immediate local processing.';
  }

  return {
    mainCategory,
    healthyPercentage: healthyPct,
    rottenPercentage: rottenPct,
    sproutedPercentage: sproutedPct,
    damagedPercentage: damagedPct,
    confidence: winningPct,
    detailedDetections,
    qualityText,
    recommendationText,
    executionTimeMs,
  };
}

export function disposeCachedModels(): void {
  try {
    if (cachedMain) cachedMain.model.dispose();
  } catch (e) {
    console.warn('Dispose main model error:', e);
  }
  try {
    if (cachedSprouted && cachedSprouted !== cachedDamaged) cachedSprouted.model.dispose();
  } catch (e) {
    console.warn('Dispose sprouted model error:', e);
  }
  try {
    if (cachedDamaged && cachedDamaged !== cachedSprouted) cachedDamaged.model.dispose();
  } catch (e) {
    console.warn('Dispose damaged model error:', e);
  }

  cachedMain = null;
  cachedSprouted = null;
  cachedDamaged = null;
}

export const loadOnionModel = async () => (await loadMainModel()).model;
export const getActiveModelUrl = getConfiguredMainModelUrl;
export const setActiveModelUrl = (url: string) => setConfiguredModelUrls({ mainModel: url });
export const clearActiveModelUrl = () => setConfiguredModelUrls({ mainModel: MAIN_MODEL });
export const disposeCachedModel = disposeCachedModels;
export const loadAllModels = async () => ({
  main: await loadMainModel(),
  sprouted: cachedSprouted || await loadMainModel(),
  damaged: cachedDamaged || await loadMainModel(),
});
