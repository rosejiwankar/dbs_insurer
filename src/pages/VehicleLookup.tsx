import { useEffect, useMemo, useState } from 'react';
import { useScoreLookup } from '../hooks/useScoreLookup';
import { scoreViolations } from '../utils/dbsScoring';
import { ScoreBand, ScoreResult } from '../types/score';
import { scoreColor } from '../utils/scoreColor';

const RECENT_QUERIES_STORAGE_KEY = 'dbs_recent_vehicle_queries';
const RECENT_QUERIES_TTL_MS = 24 * 60 * 60 * 1000;

type RecentQuery = {
  regNo: string;
  band: string;
  savedAt: number;
};

export default function VehicleLookup() {
  const [regInput, setRegInput] = useState('');
  const [queryReg, setQueryReg] = useState('');
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);

  const formattedReg = useMemo(() => regInput.toUpperCase().replace(/[^A-Z0-9]/g, ''), [regInput]);
  const result = useScoreLookup(queryReg);
  const selected = result.data as ScoreResult | undefined;

  const bandKeyFromLabel = (label: string) => label.toUpperCase().replace(/\s+/g, '_') as ScoreBand;
  const bandClass = (label: string) =>
    `recent-band band-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

  const onQuery = () => {
    if (!formattedReg) return;
    setQueryReg(formattedReg);
  };

  const onRecentQuery = (reg: string) => {
    setRegInput(reg.replace(/(\w{2})(\d{2})(\w{2})(\d+)/, '$1$2 $3 $4'));
    setQueryReg(reg);
  };

  const displayScore = selected ? Math.round(selected.score) : 0;
  const needleRotation = selected ? (displayScore / 300) * 180 - 90 : -90;
  const arcLength = 267;
  const minimumVisibleScore = selected?.band === 'EXTREME_RISK' ? 18 : 0;
  const visualArcScore = Math.min(Math.max(selected ? Math.max(displayScore, minimumVisibleScore) : 0, 0), 300);
  const arcProgress = visualArcScore / 300;
  const arcOffset = arcLength * (1 - arcProgress);
  const [animatedArcOffset, setAnimatedArcOffset] = useState(arcLength);
  const selectedViolations = selected?.violations ?? [];
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setMonth(windowStart.getMonth() - 12);
  const inWindowViolations = scoreViolations(selectedViolations, 12, now);
  const lastViolation = inWindowViolations[0];
  const monthsAgo = lastViolation
    ? Math.max(0, Math.round((now.getTime() - new Date(lastViolation.date).getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : null;
  const highCount = inWindowViolations.filter((v) => v.thz === 'H').length;
  const medCount = inWindowViolations.filter((v) => v.thz === 'M').length;
  const lowCount = inWindowViolations.filter((v) => v.thz === 'L').length;
  const ownerName = selected?.ownerName || 'Owner information unavailable';
  const vehicleSpec = selected?.cc ? `${selected.cc}cc` : 'CC unavailable';
  const formatWindowMonth = (date: Date) => date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  const formatDateTime = (value?: string) =>
    value
      ? new Date(value + 'Z').toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'N/A';
  const formatDate = (value?: string) =>
    value ? new Date(value + 'Z').toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
  const gaugeColor = selected ? scoreColor(selected.band) : '#16a34a';
  const activeGaugeStroke = selected?.band === 'EXTREME_RISK' ? gaugeColor : 'url(#arcGradActive)';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_QUERIES_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as RecentQuery[];
      const nowTs = Date.now();
      const valid = parsed.filter(
        (item) =>
          item &&
          typeof item.regNo === 'string' &&
          typeof item.band === 'string' &&
          typeof item.savedAt === 'number' &&
          nowTs - item.savedAt < RECENT_QUERIES_TTL_MS
      );

      setRecentQueries(valid);
      if (valid.length !== parsed.length) {
        localStorage.setItem(RECENT_QUERIES_STORAGE_KEY, JSON.stringify(valid));
      }
    } catch {
      localStorage.removeItem(RECENT_QUERIES_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!selected) {
      setAnimatedArcOffset(arcLength);
      return;
    }

    setAnimatedArcOffset(arcLength);
    const frame = window.requestAnimationFrame(() => {
      setAnimatedArcOffset(arcOffset);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [arcLength, arcOffset, selected?.regNo]);

  useEffect(() => {
    if (!selected) return;

    setRecentQueries((prev) => {
      const next = [
        {
          regNo: selected.regNo,
          band: selected.band.replace(/_/g, ' '),
          savedAt: Date.now()
        },
        ...prev.filter((item) => item.regNo !== selected.regNo)
      ].slice(0, 10);

      localStorage.setItem(RECENT_QUERIES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [selected]);

  return (
    <div className="lookup-layout">
      <div className="lookup-sidebar-panel">
        <div className="card lookup-sidebar-card">
          <div className="card-title">Vehicle Registration Lookup</div>
          <form
            className="lookup-input-group"
            onSubmit={(e) => {
              e.preventDefault();
              onQuery();
            }}
          >
            <div>
              <div className="field-label">Registration Number</div>
              <input
                className="reg-input"
                value={regInput}
                placeholder="e.g. UP32 AB 1234"
                onChange={(e) => setRegInput(e.target.value.toUpperCase())}
              />
            </div>
            <button type="submit" className="lookup-btn">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Query DBS Score
            </button>
          </form>

          <div className="recent-queries">
            <div className="card-title" style={{ marginBottom: 10 }}>
              Recent Queries
            </div>
            <div className="recent-queries-scroll">
              {recentQueries.length ? (
                recentQueries.map((item) => (
                  <div key={item.regNo} className="recent-item" onClick={() => onRecentQuery(item.regNo)}>
                    <span className="recent-reg">{item.regNo.replace(/(\w{2})(\d{2})(\w{2})(\d+)/, '$1 $2 $3 $4')}</span>
                    <span className={bandClass(item.band)}>{item.band}</span>
                  </div>
                ))
              ) : (
                <div className="api-key-empty" style={{ marginTop: 0 }}>
                  No recent queries yet. Use the input above to look up a vehicle.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="result-panel" id="result-panel">
        {!queryReg && (
          <div
            id="empty-state"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 48, textAlign: 'center' }}
          >
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>??</div>
            <div className="hint-text" style={{ padding: 0 }}>
              Enter a vehicle registration number to query the Driver Behaviour Score
            </div>
          </div>
        )}

        {queryReg && result.isLoading && (
          <div
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 48, textAlign: 'center' }}
          >
            <div className="hint-text" style={{ padding: 0 }}>
              Loading vehicle score...
            </div>
          </div>
        )}

        {queryReg && result.isError && !result.isLoading && (
          <div
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 48, textAlign: 'center' }}
          >
            <div className="hint-text" style={{ padding: 0, color: '#dc2626' }}>
              {result.error?.message || 'Vehicle not found or lookup failed'}
            </div>
          </div>
        )}

        {selected && !result.isLoading && (
          <div id="score-result">
            <div className="score-card">
              <div className="vehicle-header">
                <div>
                  <div className="vehicle-reg">{selected.regNo || formattedReg || 'UP32 AB 1234'}</div>
                </div>
                <div className="query-time">
                  Queried: {formatDateTime(selected.queriedAt)}
                  <br />
                  <span style={{ color: 'var(--green)' }}>Data fresh as of: {formatDate(selected.freshAsOf)}</span>
                </div>
              </div>

              <div className="score-gauge-area">
                <div className="gauge-container">
                  <svg viewBox="0 0 200 110">
                    <defs>
                      <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.35" />
                        <stop offset="20%" stopColor="#991b1b" stopOpacity="0.35" />
                        <stop offset="30%" stopColor="#b91c1c" stopOpacity="0.35" />
                        <stop offset="40%" stopColor="#dc2626" stopOpacity="0.35" />
                        <stop offset="50%" stopColor="#ef4444" stopOpacity="0.35" />
                        <stop offset="60%" stopColor="#f97316" stopOpacity="0.35" />
                        <stop offset="70%" stopColor="#eab308" stopOpacity="0.35" />
                        <stop offset="80%" stopColor="#22c55e" stopOpacity="0.35" />
                        <stop offset="90%" stopColor="#16a34a" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.35" />
                      </linearGradient>
                      <linearGradient id="arcGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.9" />
                        <stop offset="20%" stopColor="#991b1b" stopOpacity="0.9" />
                        <stop offset="30%" stopColor="#b91c1c" stopOpacity="0.9" />
                        <stop offset="40%" stopColor="#dc2626" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#ef4444" stopOpacity="0.9" />
                        <stop offset="60%" stopColor="#f97316" stopOpacity="0.9" />
                        <stop offset="70%" stopColor="#eab308" stopOpacity="0.9" />
                        <stop offset="80%" stopColor="#22c55e" stopOpacity="0.9" />
                        <stop offset="90%" stopColor="#16a34a" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 15 100 A 85 85 0 0 1 185 100"
                      fill="none"
                      stroke="url(#arcGrad)"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <path
                      id="gauge-arc"
                      d="M 15 100 A 85 85 0 0 1 185 100"
                      fill="none"
                      stroke={activeGaugeStroke}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={arcLength}
                      strokeDashoffset={animatedArcOffset}
                      style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                    />
                    <g id="needle-group" transform={`rotate(${needleRotation} 100 100)`}>
                      <line x1="100" y1="100" x2="100" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="100" cy="100" r="5" fill="white" />
                      <circle cx="100" cy="100" r="2.5" fill="var(--bg)" />
                    </g>
                  </svg>
                  <div className="gauge-score-label">
                    <span className="gauge-number" style={{ color: gaugeColor }}>
                      {displayScore}
                    </span>
                    <span className="gauge-band" style={{ color: gaugeColor }}>
                      {selected.band.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="score-breakdown-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="score-metric">
                    <div className="metric-label">Owner Name</div>
                    <div className="metric-value" style={{ fontSize: 16, marginTop: 3 }}>{ownerName}</div>
                    <div className="metric-sub">{selected.stateName || 'Unknown State'}</div>
                  </div>
                  <div className="score-metric">
                    <div className="metric-label">Vehicle Details</div>
                    <div className="metric-value" style={{ fontSize: 16, marginTop: 3 }}>
                      {selected.vehicleType || 'Vehicle'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selected && !result.isLoading && (
        <div className="lookup-full-width">
          <div className="violations-card">
            <div className="violations-header">
              <div>
                <div className="title">Violation History</div>
                <div className="subtitle">{inWindowViolations.length} violations in scoring window</div>
              </div>
              <div className="window-badge">
                12-month window - {formatWindowMonth(windowStart)} to {formatWindowMonth(now)}
              </div>
            </div>
            <div className="score-breakdown-grid" style={{ margin: '0 20px 18px' }}>
              <div className="score-metric">
                <div className="metric-label">Violations (12mo)</div>
                <div className="metric-value amber">{inWindowViolations.length}</div>
                <div className="metric-sub">
                  {highCount} High / {medCount} Medium / {lowCount} Low
                </div>
              </div>
              <div className="score-metric">
                <div className="metric-label">Last Violation</div>
                <div className="metric-value" style={{ fontSize: 16, marginTop: 3 }}>
                  {lastViolation ? `${monthsAgo ?? 0} months ago` : 'No recent violations'}
                </div>
                <div className="metric-sub">
                  {lastViolation
                    ? new Date(lastViolation.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : 'N/A'}
                </div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Challan Details</th>
                  <th>Offense Details</th>
                  <th>Category</th>
                  <th>Category Deduction</th>
                  <th>Repeat Multiplier</th>
                  <th>Final Points</th>
                </tr>
              </thead>
              <tbody>
                {inWindowViolations.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11, padding: '12px 20px' }}>
                      <span style={{ color: 'var(--text3)' }}>No violations found in scoring window</span>
                    </td>
                  </tr>
                )}
                {inWindowViolations.map((violation, idx) => {
                  const categoryLabel = [violation.categoryName, violation.categoryDescription].filter(Boolean).join(' - ');

                  return (
                    <tr key={`${violation.type}-${violation.date}-${idx}`}>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
                        {new Date(violation.date).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div className="violation-type">{violation.challanDetails || violation.type}</div>
                      </td>
                      <td style={{ fontSize: 11 }}>{violation.type}</td>
                      <td style={{ fontSize: 11 }}>{categoryLabel || violation.code}</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>-{violation.basePoints} pts</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{violation.multiplier}x</td>
                      <td>
                        <span className={violation.impactPoints >= 40 ? 'points-impact' : 'points-impact low'}>
                          -{violation.impactPoints} pts
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
