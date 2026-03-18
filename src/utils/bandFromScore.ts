import { ScoreBand } from '../types/score';

export function bandFromScore(score: number): ScoreBand {
  if (score >= 267) return 'EXCELLENT';
  if (score >= 217) return 'GOOD';
  if (score >= 150) return 'AVERAGE';
  if (score >= 100) return 'POOR';
  return 'HIGH_RISK';
}
