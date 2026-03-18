export type ScoreBand = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'HIGH_RISK';

export interface Violation {
  type: string;
  date: string;
  location: string;
  thz: 'H' | 'M' | 'L';
  status: 'Open' | 'Paid' | 'Disputed';
  impact: number;
}

export interface ScoreResult {
  regNo: string;
  vehicleType: string;
  score: number;
  band: ScoreBand;
  severityIndex: number;
  recentTrend: 'Up' | 'Stable' | 'Down';
  challanStatus: string;
  tpLoading: number;
  violations: Violation[];
}
