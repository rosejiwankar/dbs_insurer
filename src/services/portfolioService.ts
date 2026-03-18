import { sampleVehicleScores } from './mockData';

export type PortfolioFilters = {
  vehicleType?: string;
};

export interface PortfolioKPIs {
  activePolicies: number;
  avgScore: number;
  highRiskCount: number;
  tpLoadingRevenue: number;
}

export interface PortfolioChartData {
  band: string;
  count: number;
}

export async function fetchPortfolioKPIs(): Promise<PortfolioKPIs> {
  await new Promise((resolve) => setTimeout(resolve, 220));
  const values = Object.values(sampleVehicleScores);
  const activePolicies = values.length;
  const avgScore = Math.round(values.reduce((acc, v) => acc + v.score, 0) / Math.max(1, values.length));
  const highRiskCount = values.filter((v) => v.band === 'POOR' || v.band === 'HIGH_RISK').length;
  const tpLoadingRevenue = values.reduce((acc, v) => acc + v.tpLoading, 0);
  return { activePolicies, avgScore, highRiskCount, tpLoadingRevenue };
}

export async function fetchPortfolioDistribution() {
  await new Promise((resolve) => setTimeout(resolve, 220));
  const map: Record<string, number> = { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0, HIGH_RISK: 0 };
  Object.values(sampleVehicleScores).forEach((v) => {
    map[v.band] = (map[v.band] || 0) + 1;
  });
  return Object.entries(map).map(([band, count]) => ({ band, count }));
}
