import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePortfolioData } from '../hooks/usePortfolioData';

export default function PortfolioAnalytics() {
  const { kpis, distribution } = usePortfolioData();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Portfolio Analytics</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Active Policies</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.data?.activePolicies ?? '--'}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Avg DBS Score</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.data?.avgScore ?? '--'}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">High Risk Count</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.data?.highRiskCount ?? '--'}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">TP Loading Revenue</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.data?.tpLoadingRevenue.toLocaleString('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}) ?? '--'}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Band Distribution</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution.data || []}>
              <XAxis dataKey="band" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
