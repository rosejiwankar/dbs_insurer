import { useMemo, useState } from 'react';
import dbsLogo from '../assets/dbs-logo.png';
import { useAuthStore } from '../store/authStore';
import { sampleVehicleScores } from '../services/mockData';
import { calculateScoreFromViolations, premiumAdjustmentPercent, scoreViolations } from '../utils/dbsScoring';
import { scoreColor } from '../utils/scoreColor';
import { ScoreBand } from '../types/score';

type TabKey = 'lookup' | 'portfolio' | 'batch' | 'api';

const pageTitles: Record<TabKey, string> = {
  lookup: 'Vehicle Lookup',
  portfolio: 'Portfolio Analytics',
  batch: 'Batch Processing',
  api: 'API Console'
};

const buildScoreMap = () =>
  Object.fromEntries(
    Object.entries(sampleVehicleScores).map(([reg, data]) => {
      const computed = calculateScoreFromViolations(data.violations);
      return [
        reg,
        {
          score: computed.score,
          band: computed.band
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          color: scoreColor(computed.band)
        }
      ];
    })
  );

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<TabKey>('lookup');
  const [regInput, setRegInput] = useState('');
  const [selected, setSelected] = useState<{score:number;band:string;color:string} | null>(null);
  const [selectedReg, setSelectedReg] = useState('');
  const [showResult, setShowResult] = useState(false);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const activePage = pageTitles[activeTab];
  const bandClass = (label: string) =>
    `band-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
  const sampleScores = useMemo(() => buildScoreMap(), []);
  const bandKeyFromLabel = (label: string) => label.toUpperCase().replace(/\s+/g, '_') as ScoreBand;

  const formattedReg = useMemo(() => regInput.toUpperCase().replace(/[^A-Z0-9]/g, ''), [regInput]);

  const onQuery = () => {
    if (!formattedReg) return;
    const item = sampleScores[formattedReg as keyof typeof sampleScores];
    setSelected(item || { score: 276, band: 'Responsible', color: '#16a34a' });
    setSelectedReg(formattedReg);
    setShowResult(true);
  };

  const onSample = (reg: string) => {
    const item = sampleScores[reg as keyof typeof sampleScores];
    if (!item) return;
    setRegInput(reg.replace(/(\w{2})(\d{2})(\w{2})(\d+)/, '$1$2 $3 $4'));
    setSelected(item);
    setSelectedReg(reg);
    setShowResult(true);
  };

  const displayScore = selected ? Math.round(selected.score) : 0;
  const needleRotation = selected ? (displayScore / 300) * 180 - 90 : -90;
  const arcLength = 267;
  const arcProgress = Math.min(Math.max(displayScore, 0), 300) / 300;
  const arcOffset = arcLength * (1 - arcProgress);
  const selectedRecord = selectedReg ? sampleVehicleScores[selectedReg] : undefined;
  const selectedViolations = selectedRecord?.violations ?? [];
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
  const totalVehicles = Object.keys(sampleScores).length;
  const higherScores = Object.values(sampleScores).filter((v) => v.score > (selected?.score ?? 0)).length;
  const percentile = totalVehicles ? Math.round(((totalVehicles - higherScores) / totalVehicles) * 100) : 0;
  const basePremium = 2094;
  const selectedBandKey = selected ? bandKeyFromLabel(selected.band) : undefined;
  const adjustment = selectedBandKey ? premiumAdjustmentPercent(selectedBandKey) : 0;
  const tpLoading = Math.round((basePremium * adjustment) / 100);
  const adjustedPremium = basePremium + tpLoading;
  const loadingApplicable = adjustment > 0;
  const adjustmentLabel = adjustment < 0 ? 'Discount Applied' : adjustment > 0 ? 'Loading Applicable' : 'No Loading Applicable';
  const formatWindowMonth = (d: Date) => d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={dbsLogo} alt="DBS logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
          <div className="logo-sub">
            <span style={{ display: 'block', whiteSpace: 'nowrap' }}>Driver Behaviour</span>
            <span style={{ display: 'block', whiteSpace: 'nowrap' }}>Score</span>
          </div>
        </div>

        <div className="insurer-badge">
          <div className="label">Logged in as</div>
          <div className="name">{user?.insurer ?? 'Bajaj Allianz General Insurance'}</div>
        </div>

        <nav className="nav">
          <div className="nav-section">Underwriting</div>
          <div className={`nav-item ${activeTab === 'lookup' ? 'active' : ''}`} onClick={() => setActiveTab('lookup')}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Vehicle Lookup
          </div>
          <div className={`nav-item ${activeTab === 'batch' ? 'active' : ''}`} onClick={() => setActiveTab('batch')}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
            Batch Processing
            <span className="nav-badge">3</span>
          </div>

          <div className="nav-section">Analytics</div>
          <div className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            Portfolio Analytics
          </div>

          <div className="nav-section">Developer</div>
          <div className={`nav-item ${activeTab === 'api' ? 'active' : ''}`} onClick={() => setActiveTab('api')}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            API Console
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="api-status">
            <div className="status-dot"></div>
            DBS API · All systems operational
          </div>
          <button onClick={logout} className="lookup-btn" style={{ width: '100%', marginTop: 8, background: '#fee2e2', border: '1px solid #dc2626', color: '#991b1b' }}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span className="page-title">{activePage}</span>
          <div className="topbar-right">
            <div className="topbar-stat">Today's queries: <strong>847</strong></div>
            <div className="topbar-stat">Avg response: <strong>124ms</strong></div>
            <div className="topbar-stat" style={{ color: 'var(--green)' }}>API <strong style={{ color: 'var(--green)' }}>99.98%</strong> uptime</div>
          </div>
        </header>

        <div className="content">
          <div className={`screen ${activeTab === 'lookup' ? 'active' : ''}`} id="screen-lookup">
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
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      Query DBS Score
                    </button>
                  </div>

                  <div className="recent-queries">
                    <div className="card-title" style={{ marginBottom: 10 }}>Recent Queries</div>
                    {Object.keys(sampleScores).map((reg) => (
                      <div key={reg} className="recent-item" onClick={() => onSample(reg)}>
                        <span className="recent-reg">{reg.replace(/(\w{2})(\d{2})(\w{2})(\d+)/, '$1 $2 $3 $4')}</span>
                        <span className={`recent-band ${bandClass(sampleScores[reg as keyof typeof sampleScores].band)}`}>{sampleScores[reg as keyof typeof sampleScores].band}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="result-panel" id="result-panel">
                {!showResult && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 48, textAlign: 'center' }} id="empty-state">
                    <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>🔍</div>
                    <div className="hint-text" style={{ padding: 0 }}>Enter a vehicle registration number to query the Driver Behaviour Score</div>
                  </div>
                )}

                {showResult && selected && (
                  <div id="score-result">
                    <div className="score-card">
                      <div className="vehicle-header">
                        <div>
                          <div className="vehicle-reg">{formattedReg || 'UP32 AB 1234'}</div>
                          <div className="vehicle-meta">
                            <span>🚗 Private Car · 1197cc</span>
                            <span>📍 Uttar Pradesh</span>
                            <span>Petrol</span>
                          </div>
                        </div>
                        <div className="query-time">
                          Queried: 12 Mar 2026, 11:42 AM<br />
                          <span style={{ color: 'var(--green)' }}>Data fresh as of: 11 Mar 2026</span>
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
                            <path
                              d="M 15 100 A 85 85 0 0 1 185 100"
                              fill="none"
                              stroke="url(#arcGradActive)"
                              strokeWidth="12"
                              strokeLinecap="round"
                              strokeDasharray={arcLength}
                              strokeDashoffset={arcOffset}
                              style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                              id="gauge-arc"
                            />
                            <g id="needle-group" transform={`rotate(${needleRotation} 100 100)`}>
                              <line x1="100" y1="100" x2="100" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                              <circle cx="100" cy="100" r="5" fill="white" />
                              <circle cx="100" cy="100" r="2.5" fill="var(--bg)" />
                            </g>
                          </svg>
                          <div className="gauge-score-label">
                            <span className="gauge-number" style={{ color: selected.color }}>{displayScore}</span>
                            <span className="gauge-band" style={{ color: selected.color }}>{selected.band.toUpperCase()}</span>
                          </div>
                        </div>

                        <div className="score-breakdown-grid">
                          <div className="score-metric">
                          <div className="metric-label">Violations (12mo)</div>
                          <div className="metric-value amber">{inWindowViolations.length}</div>
                          <div className="metric-sub">{highCount} High · {medCount} Medium · {lowCount} Low</div>
                        </div>
                        <div className="score-metric">
                          <div className="metric-label">Last Violation</div>
                          <div className="metric-value" style={{ fontSize: 14, marginTop: 3 }}>
                            {lastViolation ? `${monthsAgo ?? 0} months ago` : 'No recent violations'}
                          </div>
                          <div className="metric-sub">{lastViolation ? new Date(lastViolation.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</div>
                        </div>
                        <div className="score-metric">
                          <div className="metric-label">Score Trend</div>
                          <div className={`metric-value ${selectedRecord?.recentTrend === 'Down' ? 'red' : 'green'}`}>
                            {selectedRecord?.recentTrend === 'Down' ? '↓' : selectedRecord?.recentTrend === 'Stable' ? '→' : '↑'} {selectedRecord?.recentTrend ?? 'Stable'}
                          </div>
                          <div className="metric-sub">vs 6 months ago</div>
                        </div>
                        <div className="score-metric">
                          <div className="metric-label">Percentile</div>
                          <div className="metric-value green">Top {percentile}%</div>
                          <div className="metric-sub">of all vehicles</div>
                        </div>
                        </div>
                      </div>

                      <div className="premium-box">
                        <div className="premium-label">
                          TP Premium Adjustment
                          <strong>{adjustmentLabel}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div className="premium-badge">
                            <div className="badge-label">Base TP Premium</div>
                            <div className="badge-value">₹ {basePremium.toLocaleString('en-IN')}</div>
                          </div>
                          <div className="premium-badge" style={{ borderColor: loadingApplicable ? 'rgba(245,115,22,0.35)' : 'rgba(52,199,123,0.4)', background: loadingApplicable ? 'rgba(245,115,22,0.08)' : 'rgba(52,199,123,0.08)' }}>
                            <div className="badge-label">DBS Adjusted Premium</div>
                            <div className="badge-value" style={{ color: loadingApplicable ? '#f97316' : 'var(--green)' }}>₹ {adjustedPremium.toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="violations-card">
                      <div className="violations-header">
                        <div>
                          <div className="title">Violation History</div>
                          <div className="subtitle">{inWindowViolations.length} violations in scoring window</div>
                        </div>
                        <div className="window-badge">12-month window · {formatWindowMonth(windowStart)} – {formatWindowMonth(now)}</div>
                      </div>
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Violation</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Multiplier</th>
                            <th>Score Impact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inWindowViolations.length === 0 && (
                            <tr>
                              <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11, padding: '12px 20px' }}>
                                <span style={{ color: 'var(--text3)' }}>No violations found in scoring window</span>
                              </td>
                            </tr>
                          )}
                          {inWindowViolations.map((v, idx) => {
                            const thzClass = v.thz === 'H' ? 'thz-h' : v.thz === 'M' ? 'thz-m' : 'thz-l';
                            const hazardLabel = v.thz === 'H' ? 'High Hazard' : v.thz === 'M' ? 'Medium Hazard' : 'Low Hazard';
                            const hazardColor = v.thz === 'H' ? 'var(--red)' : v.thz === 'M' ? 'var(--amber)' : 'var(--accent2)';
                            const statusClass = v.status === 'Paid' ? 'status-paid' : v.status === 'Open' ? 'status-unpaid' : 'status-court';
                            return (
                              <tr key={`${v.type}-${v.date}-${idx}`}>
                                <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{v.date}</td>
                                <td><div className="violation-type">{v.type}<span className={`thz-tag ${thzClass}`}>THZ-{v.thz}</span></div></td>
                                <td style={{ fontSize: 11, color: hazardColor }}>{hazardLabel}</td>
                                <td><span className={statusClass}>{v.status.toUpperCase()}</span></td>
                                <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{v.multiplier}×</td>
                                <td><span className={v.impactPoints >= 40 ? 'points-impact' : 'points-impact low'}>–{v.impactPoints} pts</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`screen ${activeTab === 'portfolio' ? 'active' : ''}`} id="screen-portfolio">
            <div className="portfolio-grid">
              <div className="stat-card"><div className="stat-label">Total Queries (Month)</div><div className="stat-value">24,891</div><div className="stat-change up">↑ 12% vs last month</div></div>
              <div className="stat-card"><div className="stat-label">Portfolio Avg Score</div><div className="stat-value" style={{ color: 'var(--accent2)' }}>631</div><div className="stat-change up">↑ 18 pts vs 6mo ago</div></div>
              <div className="stat-card"><div className="stat-label">High Risk Vehicles</div><div className="stat-value" style={{ color: 'var(--red)' }}>8.3%</div><div className="stat-change down">↓ 1.2% improvement</div></div>
              <div className="stat-card"><div className="stat-label">Clean Record (Exemplary)</div><div className="stat-value" style={{ color: 'var(--green)' }}>41.2%</div><div className="stat-change up">↑ 3.4% this quarter</div></div>
            </div>
            <div className="portfolio-lower">
              <div className="band-distribution">
                <div className="card-title">Portfolio Score Band Distribution</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>24,891 vehicles queried this month</div>
                <div className="band-bars">
                  <div className="band-row"><div className="band-name">Exemplary (285–300)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '18%', background: '#059669' }}></div></div><div className="band-pct">18.2%</div></div>
                  <div className="band-row"><div className="band-name">Responsible (270–284)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '12%', background: '#16a34a' }}></div></div><div className="band-pct">12.4%</div></div>
                  <div className="band-row"><div className="band-name">Average (240–269)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '20%', background: '#22c55e' }}></div></div><div className="band-pct">20.1%</div></div>
                  <div className="band-row"><div className="band-name">Marginal (210–239)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '11%', background: '#eab308' }}></div></div><div className="band-pct">11.0%</div></div>
                  <div className="band-row"><div className="band-name">At Risk (180–209)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '9%', background: '#f97316' }}></div></div><div className="band-pct">9.2%</div></div>
                  <div className="band-row"><div className="band-name">High Risk (150–179)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '8%', background: '#ef4444' }}></div></div><div className="band-pct">8.4%</div></div>
                  <div className="band-row"><div className="band-name">Serious Risk (120–149)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '7%', background: '#dc2626' }}></div></div><div className="band-pct">7.1%</div></div>
                  <div className="band-row"><div className="band-name">Chronic Violator (90–119)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '6%', background: '#b91c1c' }}></div></div><div className="band-pct">6.0%</div></div>
                  <div className="band-row"><div className="band-name">Habitual Offender (60–89)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '5%', background: '#991b1b' }}></div></div><div className="band-pct">4.9%</div></div>
                  <div className="band-row"><div className="band-name">Extreme Risk (&lt;60)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '4%', background: '#7f1d1d' }}></div></div><div className="band-pct">3.7%</div></div>
                </div>
              </div>
              <div className="loss-ratio-card">
                <div className="card-title">Loss Ratio Correlation by DBS Band</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Actuarial validation · FY 2025-26 cohort</div>
                <div className="lr-chart">
                  <div className="lr-row"><div className="lr-band" style={{ color: '#059669' }}>Exemplary</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '34%', background: '#059669' }}></div></div><div className="lr-pct" style={{ color: '#059669' }}>34%</div><div className="lr-count">7,942 veh</div></div>
                  <div className="lr-row"><div className="lr-band" style={{ color: '#16a34a' }}>Responsible</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '46%', background: '#16a34a' }}></div></div><div className="lr-pct" style={{ color: '#16a34a' }}>46%</div><div className="lr-count">5,601 veh</div></div>
                  <div className="lr-row"><div className="lr-band" style={{ color: '#22c55e' }}>Average</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '61%', background: '#22c55e' }}></div></div><div className="lr-pct" style={{ color: '#22c55e' }}>61%</div><div className="lr-count">3,912 veh</div></div>
                  <div className="lr-row"><div className="lr-band" style={{ color: '#f97316' }}>At Risk</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '86%', background: '#f97316' }}></div></div><div className="lr-pct" style={{ color: '#f97316' }}>86%</div><div className="lr-count">2,114 veh</div></div>
                  <div className="lr-row"><div className="lr-band" style={{ color: '#7f1d1d' }}>Extreme Risk</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '100%', background: 'linear-gradient(90deg,#7f1d1d,#ef4444)' }}></div></div><div className="lr-pct" style={{ color: '#7f1d1d' }}>132%</div><div className="lr-count">1,248 veh</div></div>
                </div>
                <div style={{ marginTop: 14, padding: 10, background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.15)', borderRadius: 6, fontSize: 11, color: 'var(--text2)' }}>
                  ✦ Exemplary-band vehicles show <strong style={{ color: '#059669' }}>3.2× lower loss ratio</strong> than Extreme Risk band — actuarial significance confirmed
                </div>
              </div>
            </div>
          </div>

          <div className={`screen ${activeTab === 'batch' ? 'active' : ''}`} id="screen-batch">
            <div className="batch-layout">
              <div>
                <div className="card">
                  <div className="card-title">Upload Vehicle List</div>
                  <div className="upload-zone">
                    <div className="upload-icon">📋</div>
                    <div className="upload-text">Drop CSV file here or click to browse</div>
                    <div className="upload-sub">Max 10,000 registration numbers per batch</div>
                    <a href="#" className="template-link">Download CSV template</a>
                  </div>

                  <div className="batch-progress" style={{ marginTop: 14 }}>
                    <div className="progress-label">
                      <span>Processing: renewal_batch_mar26.csv</span>
                      <span style={{ color: 'var(--accent2)' }}>68%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill"></div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text2)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>1,428 / 2,100 processed</span>
                      <span style={{ color: 'var(--green)' }}>Est. 35 sec remaining</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
                    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 16, color: 'var(--green)' }}>1,428</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Scored</div>
                    </div>
                    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 16, color: 'var(--amber)' }}>12</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Errors</div>
                    </div>
                    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 16, color: 'var(--text2)' }}>672</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Pending</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="batch-results-table">
                <div className="results-toolbar">
                  <div className="results-count">Showing <strong>1,428</strong> results</div>
                  <div style={{ display: 'flex', gap: 6, marginLeft: 16 }}>
                    <span style={{ fontSize: 11, background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', color: '#059669', padding: '3px 10px', borderRadius: 20 }}>Exemplary: 589</span>
                    <span style={{ fontSize: 11, background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', color: '#16a34a', padding: '3px 10px', borderRadius: 20 }}>Responsible: 402</span>
                    <span style={{ fontSize: 11, background: 'rgba(127,29,29,0.1)', border: '1px solid rgba(127,29,29,0.2)', color: '#7f1d1d', padding: '3px 10px', borderRadius: 20 }}>Extreme Risk: 87</span>
                  </div>
                  <button className="export-btn">↓ Export CSV</button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Registration No.</th>
                      <th>Vehicle Type</th>
                      <th>DBS Score</th>
                      <th>Band</th>
                      <th>Violations</th>
                      <th>TP Loading (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP32 AB 1234</td>
                      <td>Private Car</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: '#22c55e' }}>252</td>
                      <td><span className="recent-band band-average">Average</span></td>
                      <td>2</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>0</td>
                    </tr>
                    <tr>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP14 CD 5678</td>
                      <td>Two Wheeler</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: '#059669' }}>294</td>
                      <td><span className="recent-band band-exemplary">Exemplary</span></td>
                      <td>0</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>0</td>
                    </tr>
                    <tr>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP80 EF 9012</td>
                      <td>Private Car</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: '#ef4444' }}>165</td>
                      <td><span className="recent-band band-high-risk">High Risk</span></td>
                      <td>9</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--red)' }}>+1,800</td>
                    </tr>
                    <tr>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP65 GH 3456</td>
                      <td>Goods Vehicle</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: '#f97316' }}>198</td>
                      <td><span className="recent-band band-at-risk">At Risk</span></td>
                      <td>4</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--amber)' }}>+3,200</td>
                    </tr>
                    <tr>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP23 IJ 7890</td>
                      <td>Private Car</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: '#16a34a' }}>276</td>
                      <td><span className="recent-band band-responsible">Responsible</span></td>
                      <td>0</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>0</td>
                    </tr>
                    <tr>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP41 KL 2345</td>
                      <td>Two Wheeler</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: '#b91c1c' }}>108</td>
                      <td><span className="recent-band band-chronic-violator">Chronic Violator</span></td>
                      <td>6</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--orange)' }}>+380</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={`screen ${activeTab === 'api' ? 'active' : ''}`} id="screen-api">
            <div className="api-layout">
              <div>
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-title">API Credentials</div>
                  <div style={{ marginBottom: 12 }}>
                    <div className="field-label">Live API Key</div>
                    <div className="api-key-box">
                      <div className="api-key-value">dbs_live_baj••••••••••••••••••••••••••••xyz9</div>
                      <button className="copy-btn">Copy</button>
                    </div>
                  </div>
                  <div>
                    <div className="field-label">Sandbox API Key</div>
                    <div className="api-key-box">
                      <div className="api-key-value">dbs_test_baj••••••••••••••••••••••••••••abc1</div>
                      <button className="copy-btn">Copy</button>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, padding: 12, background: 'var(--surface2)', borderRadius: 8, fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text2)', lineHeight: 1.8 }}>
                    <span style={{ color: 'var(--text3)' }}>POST</span> https://api.dbs.sii.in/v1/score<br />
                    <span style={{ color: 'var(--text3)' }}>Header:</span> Authorization: Bearer dbs_live_baj••••••••••••••••••••••••••••xyz9<br />
                    <span style={{ color: 'var(--text3)' }}>Body:</span> {'{'} "reg_no": "UP32AB1234" {'}'}
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">SLA Metrics (Live)</div>
                  <div className="sla-grid">
                    <div className="sla-item"><div className="sla-value">99.98%</div><div className="sla-label">Uptime (30d)</div></div>
                    <div className="sla-item"><div className="sla-value">124ms</div><div className="sla-label">Avg Response</div></div>
                    <div className="sla-item"><div className="sla-value">847</div><div className="sla-label">Calls Today</div></div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Recent API Calls</div>
                <div className="log-list">
                  <div className="log-item" style={{ background: 'var(--surface3)', fontSize: 10, fontWeight: 500 }}>
                    <span>TIME</span><span>REG NO.</span><span>ENDPOINT</span><span>RESP (ms)</span><span>STATUS</span>
                  </div>
                  <div className="log-item"><span className="log-time">11:48:32</span><span className="log-reg">UP32AB****</span><span className="log-endpoint">/v1/score</span><span className="log-ms">112ms</span><span className="log-status log-200">200</span></div>
                  <div className="log-item"><span className="log-time">11:48:11</span><span className="log-reg">MH04CD****</span><span className="log-endpoint">/v1/score</span><span className="log-ms">98ms</span><span className="log-status log-200">200</span></div>
                  <div className="log-item"><span className="log-time">11:47:59</span><span className="log-reg">DL8CAF****</span><span className="log-endpoint">/v1/score</span><span className="log-ms">134ms</span><span className="log-status log-200">200</span></div>
                  <div className="log-item"><span className="log-time">11:47:45</span><span className="log-reg">KA01MN****</span><span className="log-endpoint">/v1/score</span><span className="log-ms">—</span><span className="log-status log-404">404</span></div>
                  <div className="log-item"><span className="log-time">11:47:30</span><span className="log-reg">TN09GH****</span><span className="log-endpoint">/v1/score</span><span className="log-ms">141ms</span><span className="log-status log-200">200</span></div>
                  <div className="log-item"><span className="log-time">11:47:18</span><span className="log-reg">UP80EF****</span><span className="log-endpoint">/v1/batch</span><span className="log-ms">2.1s</span><span className="log-status log-200">200</span></div>
                  <div className="log-item"><span className="log-time">11:46:55</span><span className="log-reg">GJ05AB****</span><span className="log-endpoint">/v1/score</span><span className="log-ms">119ms</span><span className="log-status log-200">200</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
