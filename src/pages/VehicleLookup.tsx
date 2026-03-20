import { ChangeEvent, useMemo, useState } from 'react';
import { useScoreLookup } from '../hooks/useScoreLookup';
import ScoreGauge from '../components/ScoreGauge';
import BandBadge from '../components/BandBadge';
import { ScoreResult } from '../types/score';

const sampleRegs = [
  'MH31AB1234',
  'UP32CD5678',
  'DL8CAF9012',
  'KA01MN3456',
  'TN09GH1122',
  'RJ14KL7788',
  'GJ05QW3344',
  'AP39ZX5566',
  'HR26TT9090',
  'WB20LM4433',
  'MP09RS7711'
];

export default function VehicleLookup() {
  const [input, setInput] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [recent, setRecent] = useState<string[]>([]);
  const { data, isLoading, isError } = useScoreLookup(query);

  const result = data as ScoreResult | undefined;

  const handleSearch = () => {
    const norm = input.trim().toUpperCase().replace(/\s+/g, '');
    if (!norm) return;
    setQuery(norm);
    setRecent((prev: string[]) => [norm, ...prev.filter((r) => r !== norm)].slice(0, 10));
  };

  const empty = !query;

  const summary = useMemo(() => {
    if (!result) return null;
    return {
      vehicleType: result.vehicleType,
      tpLoading: result.tpLoading,
      challanStatus: result.challanStatus
    };
  }, [result]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr] p-4 lg:p-6">
      <section className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
        <h2 className="text-base font-semibold text-slate-800">Vehicle Lookup</h2>
        <div className="mt-4 flex flex-col gap-3">
          <input
            placeholder="Enter reg number"
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button onClick={handleSearch} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Fetch Score</button>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-700">Quick samples</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {sampleRegs.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setInput(r); setQuery(r); setRecent((prev) => [r, ...prev.filter((x) => x !== r)].slice(0, 10));
                }}
                className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-blue-50"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-700">Recent queries</h3>
          <ul className="mt-2 space-y-1">
            {recent.length === 0 ? (
              <li className="text-sm text-slate-500">No history yet</li>
            ) : (
              recent.map((r) => (
                <li key={r}>
                  <button onClick={() => { setInput(r); setQuery(r); }} className="text-xs text-blue-600 hover:underline">{r}</button>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
        <h2 className="text-base font-semibold text-slate-800">Result</h2>
        {empty && <p className="mt-3 text-sm text-slate-500">Enter a registration number and click Fetch Score.</p>}
        {isLoading && <p className="mt-3 text-sm text-blue-600">Loading...</p>}
        {isError && !isLoading && <p className="mt-3 text-sm text-red-600">Vehicle not found or error</p>}

        {result && !isLoading && (
          <div className="mt-4 grid gap-5 lg:grid-cols-[240px_1fr]">
            <div className="space-y-2">
              <div className="text-xl font-bold tracking-wide text-slate-900">{result.regNo}</div>
              <div className="text-sm text-slate-600">{result.vehicleType}</div>
              <BandBadge band={result.band} />
              <div className="text-sm text-slate-700">TP Loading: <span className="font-semibold">{result.tpLoading.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span></div>
              <div className="text-sm text-slate-700">Challan: <span className="font-semibold">{result.challanStatus}</span></div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-[260px]">
                <ScoreGauge score={result.score} band={result.band} />
              </div>
            </div>
          </div>
        )}

        {result && result.violations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-700">Violations</h3>
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2">THZ</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {result.violations.map((v, idx) => (
                    <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2">{v.type}</td>
                      <td className="px-3 py-2">{v.date}</td>
                      <td className="px-3 py-2">{v.location}</td>
                      <td className="px-3 py-2">{v.thz}</td>
                      <td className="px-3 py-2">{v.status}</td>
                      <td className="px-3 py-2">{v.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
