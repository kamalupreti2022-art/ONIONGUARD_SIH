/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  DefectCounts, 
  DefectPercentages, 
  DetailedDetectionItem, 
  ImageAnalysisItem, 
  ModelEngineType 
} from '../types';
import { 
  predictSingleOnionPhoto, 
  checkAllModelsStatus 
} from './tfModelService';

export interface MultiScanResult {
  totalAnalyzed: number;
  items: ImageAnalysisItem[];
  counts: DefectCounts;
  percentages: DefectPercentages;
  detailedDetections: DetailedDetectionItem[];
  gradeA: number;
  gradeURS: number;
  qualitySummary: string;
  modelAvailable: boolean;
  modelEngine: ModelEngineType;
  modelNotice?: string;
}

/**
 * Genuinely analyzes uploaded onion images individually across:
 * 1. Main Onion Model (8 classes: 4 healthy, 4 rotten)
 * 2. Dedicated Sprouted Model
 * 3. Dedicated Damaged Model
 * 
 * Never combines photos into one image.
 * Aggregates per-image real probabilities without fake or random data.
 */
export async function analyzeUploadedOnionImages(
  images: string[],
  selectedEngine: ModelEngineType = 'tfjs_local',
  customModelConnected: boolean = false
): Promise<MultiScanResult> {
  if (images.length === 0) {
    throw new Error('No images provided for analysis');
  }

  try {
    const items: ImageAnalysisItem[] = [];

    // Analyze each image individually
    for (let i = 0; i < images.length; i++) {
      const singleResult = await predictSingleOnionPhoto(images[i]);

      const item: ImageAnalysisItem = {
        id: `img-item-${i + 1}-${Date.now()}`,
        imageIndex: i + 1,
        imageSrc: images[i],
        prediction: singleResult.mainCategory === 'HEALTHY' 
          ? 'healthy' 
          : singleResult.mainCategory === 'SPROUTED' 
          ? 'sprouted' 
          : 'rotten',
        mainCategory: singleResult.mainCategory,
        label: singleResult.mainCategory,
        healthyPercentage: singleResult.healthyPercentage,
        rottenPercentage: singleResult.rottenPercentage,
        sproutedPercentage: singleResult.sproutedPercentage,
        damagedPercentage: singleResult.damagedPercentage,
        confidence: singleResult.confidence,
        qualityInterpretation: singleResult.qualityText,
        recommendation: singleResult.recommendationText,
        detailedDetections: singleResult.detailedDetections,
        reason: `AI multi-model inference: Healthy ${singleResult.healthyPercentage}%, Rotten ${singleResult.rottenPercentage}%, Sprouted ${singleResult.sproutedPercentage}%, Damaged ${singleResult.damagedPercentage}%.`,
        sizeReferenceDetected: false,
        bulbDetected: true,
      };

      items.push(item);
    }

    const totalAnalyzed = items.length;

    // Aggregation: Average per-image probabilities across all analyzed photos
    const avgHealthy = Math.round(
      items.reduce((sum, item) => sum + item.healthyPercentage, 0) / totalAnalyzed
    );
    const avgRotten = Math.round(
      items.reduce((sum, item) => sum + item.rottenPercentage, 0) / totalAnalyzed
    );
    const avgSprouted = Math.round(
      items.reduce((sum, item) => sum + item.sproutedPercentage, 0) / totalAnalyzed
    );
    const avgDamaged = Math.round(
      items.reduce((sum, item) => sum + item.damagedPercentage, 0) / totalAnalyzed
    );

    // Aggregate the 10 detailed detection items across all photos
    const detailedDetections: DetailedDetectionItem[] = [];
    if (items.length > 0 && items[0].detailedDetections) {
      items[0].detailedDetections.forEach((templateDet, detIdx) => {
        const avgDetPct = Math.round(
          items.reduce((sum, it) => {
            const match = it.detailedDetections?.[detIdx];
            return sum + (match ? match.percentage : 0);
          }, 0) / totalAnalyzed
        );
        detailedDetections.push({
          ...templateDet,
          percentage: avgDetPct,
          probability: avgDetPct / 100,
        });
      });
    }

    // Counts based on dominant classification
    const healthyCount = items.filter(it => it.mainCategory === 'HEALTHY').length;
    const rottenCount = items.filter(it => it.mainCategory === 'ROTTEN').length;
    const sproutedCount = items.filter(it => it.mainCategory === 'SPROUTED').length;
    const damagedCount = items.filter(it => it.damagedPercentage >= 40).length;

    const counts: DefectCounts = {
      healthy: healthyCount,
      rotten: rottenCount,
      sprouted: sproutedCount,
      damaged: damagedCount,
      unableToDetermine: 0,
    };

    const percentages: DefectPercentages = {
      healthy: avgHealthy,
      rotten: avgRotten,
      sprouted: avgSprouted,
      damaged: avgDamaged,
      unableToDetermine: 0,
    };

    const gradeA = avgHealthy;
    const gradeURS = Math.min(100, avgRotten + avgSprouted);

    let qualitySummary = `Analyzed ${totalAnalyzed} individual onion photo${totalAnalyzed > 1 ? 's' : ''} using the 3-model neural network suite (Main 8-Class + Sprouted + Damaged). `;
    if (avgHealthy >= 70) {
      qualitySummary += `The consignment demonstrates Grade A commercial quality with ${avgHealthy}% Healthy sound bulbs, ${avgRotten}% Rotten incidence, and ${avgSprouted}% Sprouted indication.`;
    } else if (avgSprouted > 30) {
      qualitySummary += `High sprouting detected (${avgSprouted}% Sprouted bulbs). Immediate segregation and prioritized consumption/processing recommended.`;
    } else {
      qualitySummary += `Elevated post-harvest defects detected (${avgRotten}% Rotten, ${avgSprouted}% Sprouted, ${avgDamaged}% Damaged). Batch sorting required before auction.`;
    }

    return {
      totalAnalyzed,
      items,
      counts,
      percentages,
      detailedDetections,
      gradeA,
      gradeURS,
      qualitySummary,
      modelAvailable: true,
      modelEngine: 'tfjs_local',
    };
  } catch (err: any) {
    console.error('[TensorFlow.js] Model execution or loading error:', err);

    const status = await checkAllModelsStatus();
    const errorNotice = err.message || status.errorMessage || 'AI model is not available. Please check the model URLs or add the trained model files.';

    return {
      totalAnalyzed: images.length,
      items: images.map((imgSrc, idx) => ({
        id: `unavail-${idx + 1}`,
        imageIndex: idx + 1,
        imageSrc: imgSrc,
        prediction: 'unable_to_determine',
        mainCategory: 'unable_to_determine',
        label: 'Unable to determine',
        healthyPercentage: 0,
        rottenPercentage: 0,
        sproutedPercentage: 0,
        damagedPercentage: 0,
        reason: errorNotice,
        qualityInterpretation: 'Model files missing or model URLs unreachable.',
        recommendation: 'Configure MAIN_MODEL, SPROUTED_MODEL, and DAMAGED_MODEL in models.ts or Settings.',
        sizeReferenceDetected: false,
        bulbDetected: false,
      })),
      counts: {
        healthy: 0,
        rotten: 0,
        sprouted: 0,
        damaged: 0,
        unableToDetermine: images.length,
      },
      percentages: {
        healthy: 0,
        rotten: 0,
        sprouted: 0,
        damaged: 0,
        unableToDetermine: 100,
      },
      detailedDetections: [],
      gradeA: 0,
      gradeURS: 0,
      qualitySummary: errorNotice,
      modelAvailable: false,
      modelEngine: 'tfjs_local',
      modelNotice: errorNotice,
    };
  }
}
