import { ScoreResult } from '../types/score';

export const sampleVehicleScores: Record<string, ScoreResult> = {
  MH31AB1234: {
    regNo: 'MH31AB1234',
    vehicleType: 'Private Car',
    score: 828,
    band: 'EXCELLENT',
    severityIndex: 8,
    recentTrend: 'Up',
    challanStatus: 'Clear',
    tpLoading: 0,
    violations: [
      { type: 'Speeding', date: '2026-03-04', location: 'Pune', thz: 'M', status: 'Paid', impact: 18 },
      { type: 'Signal Jump', date: '2025-12-21', location: 'Mumbai', thz: 'L', status: 'Paid', impact: 5 }
    ]
  },
  UP32CD5678: {
    regNo: 'UP32CD5678',
    vehicleType: 'Two Wheeler',
    score: 633,
    band: 'AVERAGE',
    severityIndex: 34,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 2800,
    violations: [
      { type: 'Red Light', date: '2026-02-10', location: 'Lucknow', thz: 'H', status: 'Open', impact: 45 },
      { type: 'Helmet violation', date: '2026-01-14', location: 'Kanpur', thz: 'M', status: 'Paid', impact: 15 }
    ]
  },
  DL8CAF9012: {
    regNo: 'DL8CAF9012',
    vehicleType: 'Goods Vehicle',
    score: 503,
    band: 'AVERAGE',
    severityIndex: 42,
    recentTrend: 'Stable',
    challanStatus: 'Clear',
    tpLoading: 1500,
    violations: [
      { type: 'Overloading', date: '2026-01-25', location: 'Delhi', thz: 'H', status: 'Paid', impact: 58 }
    ]
  },
  KA01MN3456: {
    regNo: 'KA01MN3456',
    vehicleType: 'Private Car',
    score: 289,
    band: 'HIGH_RISK',
    severityIndex: 95,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 7200,
    violations: [
      { type: 'Dangerous Driving', date: '2026-03-07', location: 'Bengaluru', thz: 'H', status: 'Open', impact: 65 },
      { type: 'No Seatbelt', date: '2026-02-19', location: 'Bengaluru', thz: 'M', status: 'Paid', impact: 25 }
    ]
  }
};
