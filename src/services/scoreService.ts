import { ScoreResult } from '../types/score';
import { sampleVehicleScores } from './mockData';
import { calculateScoreFromViolations, premiumAdjustmentPercent } from '../utils/dbsScoring';

export async function fetchScore(regNo: string): Promise<ScoreResult> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const norm = regNo.toUpperCase().replace(/\s+/g, '');
  const data = sampleVehicleScores[norm];
  if (!data) {
    throw new Error('not_found');
  }
  const { score, band } = calculateScoreFromViolations(data.violations);
  const basePremium = 2094;
  const adjustment = premiumAdjustmentPercent(band);
  const tpLoading = Math.round((basePremium * adjustment) / 100);
  return {
    ...data,
    score,
    band,
    tpLoading
  };
}
