import { useEffect, useMemo, useState } from 'react';
import { useScoreLookup } from '../hooks/useScoreLookup';
import { premiumAdjustmentPercent, scoreViolations } from '../utils/dbsScoring';
import { ScoreBand, ScoreResult } from '../types/score';
import { scoreColor } from '../utils/scoreColor';

const quickSamples = ['MH31AB1234', 'UP32CD5678', 'DL8CAF9012', 'KA01MN3456', 'TN09GH1122'];
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

  const onSample = (reg: string) => {
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
  const scoredViolations = scoreViolations(selectedViolations, 12, now);
  const inWindowViolations = scoredViolations;
  const lastViolation = inWindowViolations[0];
  const monthsAgo = lastViolation
    ? Math.max(0, Math.round((now.getTime() - new Date(lastViolation.date).getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : null;
  const highCount = inWindowViolations.filter((v) => v.thz === 'H').length;
  const medCount = inWindowViolations.filter((v) => v.thz === 'M').length;
  const lowCount = inWindowViolations.filter((v) => v.thz === 'L').length;
  const percentile = selected ? Math.max(1, Math.min(99, Math.round((selected.score / 300) * 100))) : 0;
  const basePremium = selected?.basePremium ?? 2094;
  const selectedBandKey = selected ? bandKeyFromLabel(selected.band) : undefined;
  const adjustment = selectedBandKey ? premiumAdjustmentPercent(selectedBandKey) : 0;
  const tpLoading = selected?.tpLoading ?? Math.round((basePremium * adjustment) / 100);
  const adjustedPremium = selected?.adjustedPremium ?? basePremium + tpLoading;
  const loadingApplicable = tpLoading > 0;
  const adjustmentLabel = adjustment < 0 ? 'Discount Applied' : adjustment > 0 ? 'Loading Applicable' : 'No Loading Applicable';
  const formatWindowMonth = (d: Date) => d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  const formatDateTime = (value?: string) =>
    value ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
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
      <div>
        <div className="card">
          <div className="card-title">Vehicle Registration Lookup</div>
          <div className="lookup-input-group">
            <div>
              <div className="field-label">Registration Number</div>
              <input
                className="reg-input"
                value={regInput}
                placeholder="e.g. UP32 AB 1234"
                onChange={(e) => setRegInput(e.target.value.toUpperCase())}
              />
            </div>
            <button className="lookup-btn" onClick={onQuery}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              Query DBS Score
            </button>
          </div>

          <div className="recent-queries">
            <div className="card-title" style={{ marginBottom: 10 }}>Recent Queries</div>
            {recentQueries.length ? (
              recentQueries.map((item) => (
                <div key={item.regNo} className="recent-item" onClick={() => onSample(item.regNo)}>
                  <span className="recent-reg">{item.regNo.replace(/(\w{2})(\d{2})(\w{2})(\d+)/, '$1 $2 $3 $4')}</span>
                  <span className={bandClass(item.band)}>{item.band}</span>
                </div>
              ))
            ) : (
              quickSamples.map((reg) => (
                <div key={reg} className="recent-item" onClick={() => onSample(reg)}>
                  <span className="recent-reg">{reg.replace(/(\w{2})(\d{2})(\w{2})(\d+)/, '$1 $2 $3 $4')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="result-panel" id="result-panel">
        {!queryReg && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 48, textAlign: 'center' }} id="empty-state">
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>??</div>
            <div className="hint-text" style={{ padding: 0 }}>Enter a vehicle registration number to query the Driver Behaviour Score</div>
          </div>
        )}

        {queryReg && result.isLoading && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 48, textAlign: 'center' }}>
            <div className="hint-text" style={{ padding: 0 }}>Loading vehicle score...</div>
          </div>
        )}

        {queryReg && result.isError && !result.isLoading && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 48, textAlign: 'center' }}>
            <div className="hint-text" style={{ padding: 0, color: '#dc2626' }}>{result.error?.message || 'Vehicle not found or lookup failed'}</div>
          </div>
        )}

        {selected && !result.isLoading && (
          <div id="score-result">
            <div className="score-card">
              <div className="vehicle-header">
                <div>
                  <div className="vehicle-reg">{selected.regNo || formattedReg || 'UP32 AB 1234'}</div>
                  <div className="vehicle-meta">
                    <span>{selected.vehicleType || 'Vehicle'}</span>
                    <span>{selected.stateName || 'Unknown State'}</span>
                    <span>{selected.fuelType || 'Unknown Fuel'}</span>
                  </div>
                </div>
                <div className="query-time">
                  Queried: {formatDateTime(selected.queriedAt)}<br />
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
                    <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="url(#arcGrad)" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke={activeGaugeStroke} strokeWidth="12" strokeLinecap="round" strokeDasharray={arcLength} strokeDashoffset={animatedArcOffset} style={{ transition: 'stroke-dashoffset 1.2s ease' }} id="gauge-arc" />
                    <g id="needle-group" transform={`rotate(${needleRotation} 100 100)`}>
                      <line x1="100" y1="100" x2="100" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="100" cy="100" r="5" fill="white" />
                      <circle cx="100" cy="100" r="2.5" fill="var(--bg)" />
                    </g>
                  </svg>
                  <div className="gauge-score-label">
                    <span className="gauge-number" style={{ color: gaugeColor }}>{displayScore}</span>
                    <span className="gauge-band" style={{ color: gaugeColor }}>{selected.band.toUpperCase()}</span>
                  </div>
                </div>

                <div className="score-breakdown-grid">
                  <div className="score-metric"><div className="metric-label">Violations (12mo)</div><div className="metric-value amber">{inWindowViolations.length}</div><div className="metric-sub">{highCount} High · {medCount} Medium · {lowCount} Low</div></div>
                  <div className="score-metric"><div className="metric-label">Last Violation</div><div className="metric-value" style={{ fontSize: 14, marginTop: 3 }}>{lastViolation ? `${monthsAgo ?? 0} months ago` : 'No recent violations'}</div><div className="metric-sub">{lastViolation ? new Date(lastViolation.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</div></div>
                  <div className="score-metric"><div className="metric-label">Score Trend</div><div className={`metric-value ${selected.recentTrend === 'Down' ? 'red' : 'green'}`}>{selected.recentTrend}</div><div className="metric-sub">vs 6 months ago</div></div>
                  <div className="score-metric"><div className="metric-label">Percentile</div><div className="metric-value green">Top {percentile}%</div><div className="metric-sub">of all vehicles</div></div>
                </div>
              </div>

              <div className="premium-box">
                <div className="premium-label">TP Premium Adjustment<strong>{adjustmentLabel}</strong></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="premium-badge"><div className="badge-label">Base TP Premium</div><div className="badge-value">₹ {basePremium.toLocaleString('en-IN')}</div></div>
                  <div className="premium-badge" style={{ borderColor: loadingApplicable ? 'rgba(245,115,22,0.35)' : 'rgba(52,199,123,0.4)', background: loadingApplicable ? 'rgba(245,115,22,0.08)' : 'rgba(52,199,123,0.08)' }}><div className="badge-label">DBS Adjusted Premium</div><div className="badge-value" style={{ color: loadingApplicable ? '#f97316' : 'var(--green)' }}>₹ {adjustedPremium.toLocaleString('en-IN')}</div></div>
                </div>
              </div>
            </div>

            <div className="violations-card">
              <div className="violations-header"><div><div className="title">Violation History</div><div className="subtitle">{inWindowViolations.length} violations in scoring window</div></div><div className="window-badge">12-month window · {formatWindowMonth(windowStart)} – {formatWindowMonth(now)}</div></div>
              <table>
                <thead><tr><th>Date</th><th>Violation</th><th>Category</th><th>Status</th><th>Multiplier</th><th>Score Impact</th></tr></thead>
                <tbody>
                  {inWindowViolations.length === 0 && (<tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11, padding: '12px 20px' }}><span style={{ color: 'var(--text3)' }}>No violations found in scoring window</span></td></tr>)}
                  {inWindowViolations.map((v, idx) => { const statusClass = v.status === 'Paid' ? 'status-paid' : v.status === 'Open' ? 'status-unpaid' : 'status-court'; return (<tr key={`${v.type}-${v.date}-${idx}`}><td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{new Date(v.date).toLocaleDateString('en-IN')}</td><td><div className="violation-type">{v.type}<span className="thz-tag">{v.code}</span></div></td><td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{v.code}</td><td><span className={statusClass}>{v.status.toUpperCase()}</span></td><td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{v.multiplier}×</td><td><span className={v.impactPoints >= 40 ? 'points-impact' : 'points-impact low'}>–{v.impactPoints} pts</span></td></tr>); })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
