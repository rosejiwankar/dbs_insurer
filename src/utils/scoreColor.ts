import { ScoreBand } from '../types/score';

export function scoreColor(band: ScoreBand): string {
  switch (band) {
    case 'EXCELLENT':
      return '#16a34a';
    case 'GOOD':
      return '#0ea5e9';
    case 'AVERAGE':
      return '#f59e0b';
    case 'POOR':
      return '#f97316';
    case 'HIGH_RISK':
      return '#dc2626';
    default:
      return '#64748b';
  }
}
