/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OnionDefectType = 'healthy' | 'damaged' | 'rotten' | 'sprouted' | 'other' | 'undersized' | 'unable_to_determine';

export type MainQualityCategory = 'HEALTHY' | 'ROTTEN' | 'SPROUTED' | 'unable_to_determine';

export const MODEL_8_CLASSES = [
  'red healthy onions(single)',
  'red rotten onions(single)',
  'white healthy onions(single)',
  'white rotten onions(single)',
  'red healthy onions(bulk)',
  'red rotten onions(bulk)',
  'white healthy onions(bulk)',
  'white rotten onions(bulk)',
] as const;

export type OnionModel8Class = typeof MODEL_8_CLASSES[number];

export interface DetailedDetectionItem {
  key: string;
  className: string;
  displayName: string;
  probability: number;
  percentage: number;
  category: 'HEALTHY' | 'ROTTEN' | 'SPROUTED' | 'DAMAGED';
  sourceModel: 'main' | 'sprouted' | 'damaged';
}

export interface ClassProbabilityItem {
  className: string;
  displayName: string;
  probability: number;
  percentage: number;
}

export interface Class8ProbabilityItem {
  className: string;
  displayName: string;
  probability: number;
  percentage: number;
  isHealthyGroup: boolean;
}

export interface DefectCounts {
  healthy: number;
  rotten: number;
  sprouted: number;
  damaged: number;
  other?: number;
  undersized?: number;
  unableToDetermine: number;
}

export interface DefectPercentages {
  healthy: number;
  rotten: number;
  sprouted: number;
  damaged: number;
  other?: number;
  undersized?: number;
  unableToDetermine?: number;
}

export interface ImageAnalysisItem {
  id: string;
  imageIndex: number;
  imageSrc: string;
  prediction: OnionDefectType;
  mainCategory: MainQualityCategory;
  label: string; // 'HEALTHY' | 'ROTTEN' | 'SPROUTED' | 'Unable to determine'
  healthyPercentage: number;
  rottenPercentage: number;
  sproutedPercentage: number;
  damagedPercentage: number;
  confidence?: number; // winning category confidence percentage
  qualityInterpretation?: string;
  recommendation?: string;
  allProbabilities?: ClassProbabilityItem[];
  class8Probabilities?: Class8ProbabilityItem[];
  healthyClassDetails?: Class8ProbabilityItem[];
  unhealthyClassDetails?: Class8ProbabilityItem[];
  detailedDetections?: DetailedDetectionItem[];
  highestClass?: {
    className: string;
    displayName: string;
    percentage: number;
  };
  isLowConfidence?: boolean;
  lowConfidenceWarning?: string;
  reason: string; // Transparency & explainability why it was classified
  sizeReferenceDetected: boolean;
  sizeReferenceNote?: string;
  diameterMm?: number;
  bulbDetected: boolean;
  pixelStats?: {
    onionPixelRatio: number;
    greenRatio: number;
    darkRotRatio: number;
    cutBlemishRatio: number;
  };
}

export type ModelEngineType = 'tfjs_local' | 'direct_cv';

export interface ModelStatus {
  engine: ModelEngineType;
  name: string;
  isAvailable: boolean;
  version: string;
  statusMessage: string;
  customModelFile?: string | null;
  customModelUrl?: string | null;
}

export interface BoundingBox {
  id: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // radius or box width in percentage
  defectType: OnionDefectType;
  confidence?: number;
  label: string;
  reason?: string;
}

export interface BatchData {
  batchId: string;
  procurementCentre: string;
  inspectorName: string;
  date: string;
  onionVariety: string;
  approxQuantity: string;
  notes?: string;
  farmerPhone?: string;
  farmerName?: string;
}

export interface WhatsAppDeliveryStatus {
  status: 'sent' | 'failed' | 'not_configured' | 'pending';
  message: string;
  timestamp?: string;
  maskedPhone?: string;
}

export interface AssessmentRecord {
  reportId: string;
  batch: BatchData;
  timestamp: string;
  images: string[];
  imageItems?: ImageAnalysisItem[];
  totalAnalyzed: number;
  counts: DefectCounts;
  percentages: DefectPercentages;
  detailedDetections?: DetailedDetectionItem[];
  gradeA: number; // percentage
  gradeURS: number; // Under-size, Rotten, Sprouted percentage
  qualitySummary: string;
  status: 'Completed' | 'Pending Review' | 'Flagged';
  isDemoData: boolean;
  isRealScan?: boolean;
  modelEngineUsed?: string;
  modelAvailable?: boolean;
  modelNotice?: string;
  boundingBoxes?: BoundingBox[];
  farmerWhatsAppReport?: string;
  whatsappDelivery?: WhatsAppDeliveryStatus;
}

export type ViewMode = 
  | 'landing'
  | 'dashboard'
  | 'create-batch'
  | 'image-upload'
  | 'analyzing'
  | 'analysis-results'
  | 'report'
  | 'history'
  | 'procurement-centre'
  | 'settings';

export type Language = 'en' | 'hi' | 'bn' | 'mr' | 'te' | 'ta' | 'kn' | 'gu';
