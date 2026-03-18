import { ScoreResult } from '../types/score';
import { sampleVehicleScores } from './mockData';

export async function fetchScore(regNo: string): Promise<ScoreResult> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const norm = regNo.toUpperCase().replace(/\s+/g, '');
  const data = sampleVehicleScores[norm];
  if (!data) {
    throw new Error('not_found');
  }
  return data;
}
