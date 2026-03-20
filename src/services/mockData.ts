import { ScoreResult } from '../types/score';

export const sampleVehicleScores: Record<string, ScoreResult> = {
  MH31AB1234: {
    regNo: 'MH31AB1234',
    vehicleType: 'Private Car',
    score: 294,
    band: 'EXEMPLARY',
    severityIndex: 6,
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
    score: 252,
    band: 'AVERAGE',
    severityIndex: 38,
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
    score: 198,
    band: 'AT_RISK',
    severityIndex: 62,
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
    score: 165,
    band: 'HIGH_RISK',
    severityIndex: 74,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 7200,
    violations: [
      { type: 'Dangerous Driving', date: '2026-03-07', location: 'Bengaluru', thz: 'H', status: 'Open', impact: 65 },
      { type: 'No Seatbelt', date: '2026-02-19', location: 'Bengaluru', thz: 'M', status: 'Paid', impact: 25 }
    ]
  },
  TN09GH1122: {
    regNo: 'TN09GH1122',
    vehicleType: 'Private Car',
    score: 52,
    band: 'EXTREME_RISK',
    severityIndex: 98,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 9900,
    violations: [
      { type: 'Drunk Driving', date: '2026-03-11', location: 'Chennai', thz: 'H', status: 'Open', impact: 90 },
      { type: 'Signal Jump', date: '2026-02-22', location: 'Chennai', thz: 'H', status: 'Open', impact: 60 },
      { type: 'Overspeeding', date: '2025-12-09', location: 'Chennai', thz: 'M', status: 'Paid', impact: 35 }
    ]
  },
  RJ14KL7788: {
    regNo: 'RJ14KL7788',
    vehicleType: 'Private Car',
    score: 276,
    band: 'RESPONSIBLE',
    severityIndex: 18,
    recentTrend: 'Stable',
    challanStatus: 'Clear',
    tpLoading: 250,
    violations: [
      { type: 'Signal Jump', date: '2026-01-08', location: 'Jaipur', thz: 'M', status: 'Paid', impact: 14 }
    ]
  },
  GJ05QW3344: {
    regNo: 'GJ05QW3344',
    vehicleType: 'Two Wheeler',
    score: 228,
    band: 'MARGINAL',
    severityIndex: 46,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 1100,
    violations: [
      { type: 'Helmet violation', date: '2026-03-02', location: 'Surat', thz: 'M', status: 'Open', impact: 22 },
      { type: 'Helmet violation', date: '2025-12-18', location: 'Surat', thz: 'M', status: 'Paid', impact: 18 }
    ]
  },
  AP39ZX5566: {
    regNo: 'AP39ZX5566',
    vehicleType: 'Private Car',
    score: 198,
    band: 'AT_RISK',
    severityIndex: 63,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 3200,
    violations: [
      { type: 'Speeding', date: '2026-03-14', location: 'Vijayawada', thz: 'H', status: 'Open', impact: 48 },
      { type: 'Speeding', date: '2026-01-27', location: 'Vijayawada', thz: 'H', status: 'Paid', impact: 34 },
      { type: 'Wrong Way', date: '2025-10-03', location: 'Guntur', thz: 'M', status: 'Paid', impact: 21 }
    ]
  },
  HR26TT9090: {
    regNo: 'HR26TT9090',
    vehicleType: 'Goods Vehicle',
    score: 138,
    band: 'SERIOUS_RISK',
    severityIndex: 86,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 6800,
    violations: [
      { type: 'Overloading', date: '2026-02-22', location: 'Gurugram', thz: 'H', status: 'Open', impact: 62 },
      { type: 'Overloading', date: '2025-11-16', location: 'Gurugram', thz: 'H', status: 'Paid', impact: 49 },
      { type: 'No Permit', date: '2025-09-09', location: 'Gurugram', thz: 'H', status: 'Paid', impact: 40 }
    ]
  },
  WB20LM4433: {
    regNo: 'WB20LM4433',
    vehicleType: 'Two Wheeler',
    score: 108,
    band: 'CHRONIC_VIOLATOR',
    severityIndex: 90,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 8200,
    violations: [
      { type: 'No Helmet', date: '2026-03-10', location: 'Kolkata', thz: 'H', status: 'Open', impact: 55 },
      { type: 'No Helmet', date: '2026-02-05', location: 'Kolkata', thz: 'H', status: 'Paid', impact: 44 },
      { type: 'Signal Jump', date: '2025-12-30', location: 'Kolkata', thz: 'M', status: 'Paid', impact: 21 },
      { type: 'Signal Jump', date: '2025-11-02', location: 'Kolkata', thz: 'M', status: 'Paid', impact: 19 }
    ]
  },
  MP09RS7711: {
    regNo: 'MP09RS7711',
    vehicleType: 'Private Car',
    score: 78,
    band: 'HABITUAL_OFFENDER',
    severityIndex: 94,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 9600,
    violations: [
      { type: 'Drunk Driving', date: '2026-03-06', location: 'Bhopal', thz: 'H', status: 'Open', impact: 90 },
      { type: 'Overspeeding', date: '2026-01-19', location: 'Bhopal', thz: 'H', status: 'Paid', impact: 60 },
      { type: 'Signal Jump', date: '2025-10-22', location: 'Bhopal', thz: 'M', status: 'Paid', impact: 24 }
    ]
  }
};
