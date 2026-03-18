import { useState } from 'react';
import Papa, { ParseResult } from 'papaparse';
import { submitBatch, getBatchResults } from '../services/batchService';
import { useBatchJob } from '../hooks/useBatchJob';

export default function BatchProcessing() {
  const [batchId, setBatchId] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const { data: statusData } = useBatchJob(batchId);

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result: ParseResult<Record<string, string>>) => {
        const valid = result.data.filter((r) => r.reg_no)?.slice(0, 5000);
        setRows(valid);
      },
    });
  };

  const createBatch = async () => {
    if (!rows.length) return;
    const { batchId } = await submitBatch(rows);
    setBatchId(batchId);
  };

  const loadResults = async () => {
    if (!batchId) return;
    const res = await getBatchResults(batchId);
    setRows(res.rows);
  };

  const status = statusData?.status ?? 'idle';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Batch Processing</h1>
        <p className="text-sm font-medium text-slate-600">Status: {status}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Upload CSV</label>
        <input type="file" accept=".csv" onChange={(e) => upload(e.target.files)} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm" />
        <button onClick={createBatch} disabled={!rows.length} className="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          Start Batch
        </button>
        <p className="mt-2 text-sm text-slate-500">Batch ID: {batchId || 'N/A'}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <button
          onClick={loadResults}
          disabled={!batchId || status !== 'complete'}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Load Batch Results
        </button>

        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm leading-6 text-slate-700">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Reg No.</th>
                <th className="px-3 py-2 text-left">Score</th>
                <th className="px-3 py-2 text-left">Band</th>
                <th className="px-3 py-2 text-left">TP Loading</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2">{row.reg_no}</td>
                  <td className="px-3 py-2">{row.score ?? '-'}</td>
                  <td className="px-3 py-2">{row.band ?? '-'}</td>
                  <td className="px-3 py-2">{row.tpLoading ? Number(row.tpLoading).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
