import { useAPIStatus } from '../hooks/useAPIStatus';
import { useAPILogs } from '../hooks/useAPILogs';

export default function APIConsole() {
  const status = useAPIStatus();
  const logs = useAPILogs();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">API Console</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Uptime</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{status.data?.uptime ?? '--'}%</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Avg Latency</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{status.data?.avgResponseMs ?? '--'} ms</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Calls Today</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{status.data?.callsToday ?? '--'}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Recent API Logs</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Req</th>
                <th className="px-3 py-2">Endpoint</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Latency</th>
              </tr>
            </thead>
            <tbody>
              {logs.data?.map((entry: any, idx: number) => (
                <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2">{entry.timestamp}</td>
                  <td className="px-3 py-2">{entry.regNo}</td>
                  <td className="px-3 py-2">{entry.endpoint}</td>
                  <td className="px-3 py-2">{entry.status}</td>
                  <td className="px-3 py-2">{entry.responseMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
