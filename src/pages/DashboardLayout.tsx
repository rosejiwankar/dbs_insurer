import { useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';

type TabKey = 'lookup' | 'portfolio' | 'batch' | 'api';

const pageTitles: Record<TabKey, string> = {
  lookup: 'Vehicle Lookup',
  portfolio: 'Portfolio Analytics',
  batch: 'Batch Processing',
  api: 'API Console'
};

const sampleScores = {
  MH31AB1234: { score: 841, band: 'Excellent', color: '#34c77b', needle: 72 },
  UP32CD5678: { score: 521, band: 'Average', color: '#f5a623', needle: -68 },
  DL8CAF9012: { score: 312, band: 'Poor', color: '#f57c00', needle: -118 },
  KA01MN3456: { score: 698, band: 'Good', color: '#4f8ef7', needle: 18 }
};

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<TabKey>('lookup');
  const [regInput, setRegInput] = useState('');
  const [selected, setSelected] = useState<{score:number;band:string;color:string;needle:number} | null>(null);
  const [showResult, setShowResult] = useState(false);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const activePage = pageTitles[activeTab];

  const formattedReg = useMemo(() => regInput.toUpperCase().replace(/[^A-Z0-9]/g, ''), [regInput]);

  const onQuery = () => {
    if (!formattedReg) return;
    const item = sampleScores[formattedReg as keyof typeof sampleScores];
    setSelected(item || { score: 742, band: 'Good', color: '#4f8ef7', needle: 12 });
    setShowResult(true);
  };

  const onSample = (reg: string) => {
    const item = sampleScores[reg as keyof typeof sampleScores];
    if (!item) return;
    setRegInput(reg.replace(/(\w{2})(\d{2})(\w{2})(\d+)/, '$1$2 $3 $4'));
    setSelected(item);
    setShowResult(true);
  };

  const displayScore = selected ? Math.round(selected.score / 3) : 0;

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">DBS<span>.</span></div>
          <div className="logo-sub">Driver Behaviour Score</div>
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
                        <span className={`recent-band band-${sampleScores[reg as keyof typeof sampleScores].band.toLowerCase()}`}>{sampleScores[reg as keyof typeof sampleScores].band}</span>
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
                                <stop offset="0%" stopColor="#f55353" stopOpacity="0.35" />
                                <stop offset="35%" stopColor="#f57c00" stopOpacity="0.35" />
                                <stop offset="65%" stopColor="#f5a623" stopOpacity="0.35" />
                                <stop offset="85%" stopColor="#4f8ef7" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#34c77b" stopOpacity="0.35" />
                              </linearGradient>
                              <linearGradient id="arcGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f55353" />
                                <stop offset="35%" stopColor="#f57c00" />
                                <stop offset="65%" stopColor="#f5a623" />
                                <stop offset="85%" stopColor="#4f8ef7" />
                                <stop offset="100%" stopColor="#34c77b" />
                              </linearGradient>
                            </defs>
                            <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="url(#arcGrad)" strokeWidth="12" strokeLinecap="round" />
                            <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="url(#arcGradActive)" strokeWidth="12" strokeLinecap="round" strokeDasharray="267" strokeDashoffset="69" id="gauge-arc" />
                            <g id="needle-group" transform={`rotate(${selected.needle} 100 100)`}>
                              <line x1="100" y1="100" x2="100" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                              <circle cx="100" cy="100" r="5" fill="white" />
                              <circle cx="100" cy="100" r="2.5" fill="var(--bg)" />
                            </g>
                          </svg>
                          <div className="gauge-score-label">
                            <span className="gauge-number" style={{ color: selected.color }}>{displayScore}</span>
                            <span className="gauge-band" style={{ color: selected.color }}>{selected.band.toUpperCase()} DRIVER</span>
                          </div>
                        </div>

                        <div className="score-breakdown-grid">
                          <div className="score-metric">
                            <div className="metric-label">Violations (24mo)</div>
                            <div className="metric-value amber">2</div>
                            <div className="metric-sub">1 High · 1 Medium</div>
                          </div>
                          <div className="score-metric">
                            <div className="metric-label">Last Violation</div>
                            <div className="metric-value" style={{ fontSize: 14, marginTop: 3 }}>8 months ago</div>
                            <div className="metric-sub">Sep 2025</div>
                          </div>
                          <div className="score-metric">
                            <div className="metric-label">Score Trend</div>
                            <div className="metric-value green">↑ +47</div>
                            <div className="metric-sub">vs 6 months ago</div>
                          </div>
                          <div className="score-metric">
                            <div className="metric-label">Percentile</div>
                            <div className="metric-value green">Top 28%</div>
                            <div className="metric-sub">of all vehicles</div>
                          </div>
                        </div>
                      </div>

                      <div className="premium-box">
                        <div className="premium-label">
                          TP Premium Adjustment
                          <strong>No Loading Applicable</strong>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div className="premium-badge">
                            <div className="badge-label">Base TP Premium</div>
                            <div className="badge-value">₹ 2,094</div>
                          </div>
                          <div className="premium-badge" style={{ borderColor: 'rgba(52,199,123,0.4)', background: 'rgba(52,199,123,0.08)' }}>
                            <div className="badge-label">DBS Adjusted Premium</div>
                            <div className="badge-value" style={{ color: 'var(--green)' }}>₹ 2,094</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="violations-card">
                      <div className="violations-header">
                        <div>
                          <div className="title">Violation History</div>
                          <div className="subtitle">2 violations in scoring window</div>
                        </div>
                        <div className="window-badge">24-month window · Mar 2024 – Mar 2026</div>
                      </div>
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Violation</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Fine</th>
                            <th>Score Impact</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>18 Sep 2025</td>
                            <td><div className="violation-type">Running Red Signal<span className="thz-tag thz-h">THZ-H</span></div></td>
                            <td style={{ fontSize: 11, color: 'var(--red)' }}>High Hazard</td>
                            <td><span className="status-paid">PAID</span></td>
                            <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>₹ 1,000</td>
                            <td><span className="points-impact">–85 pts</span></td>
                          </tr>
                          <tr>
                            <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>02 Mar 2025</td>
                            <td><div className="violation-type">Mobile Phone While Driving<span className="thz-tag thz-m">THZ-M</span></div></td>
                            <td style={{ fontSize: 11, color: 'var(--amber)' }}>Medium Hazard</td>
                            <td><span className="status-paid">PAID</span></td>
                            <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>₹ 500</td>
                            <td><span className="points-impact low">–42 pts</span></td>
                          </tr>
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11, padding: '12px 20px' }}>
                              <span style={{ color: 'var(--text3)' }}>3 older violations aged out of scoring window · not counted in current score</span>
                            </td>
                          </tr>
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
              <div className="stat-card"><div className="stat-label">Clean Record (Excellent)</div><div className="stat-value" style={{ color: 'var(--green)' }}>41.2%</div><div className="stat-change up">↑ 3.4% this quarter</div></div>
            </div>
            <div className="portfolio-lower">
              <div className="band-distribution">
                <div className="card-title">Portfolio Score Band Distribution</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>24,891 vehicles queried this month</div>
                <div className="band-bars">
                  <div className="band-row"><div className="band-name">Excellent (250–300)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '41%', background: 'var(--green)' }}></div></div><div className="band-pct">41.2%</div></div>
                  <div className="band-row"><div className="band-name">Good (200–249)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '28%', background: 'var(--accent)' }}></div></div><div className="band-pct">28.4%</div></div>
                  <div className="band-row"><div className="band-name">Average (150–199)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '16%', background: 'var(--amber)' }}></div></div><div className="band-pct">16.1%</div></div>
                  <div className="band-row"><div className="band-name">Poor (100–149)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '6%', background: 'var(--orange)' }}></div></div><div className="band-pct">6.0%</div></div>
                  <div className="band-row"><div className="band-name">High Risk (0–99)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '8%', background: 'var(--red)' }}></div></div><div className="band-pct">8.3%</div></div>
                </div>
              </div>
              <div className="loss-ratio-card">
                <div className="card-title">Loss Ratio Correlation by DBS Band</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Actuarial validation · FY 2025-26 cohort</div>
                <div className="lr-chart">
                  <div className="lr-row"><div className="lr-band" style={{ color: 'var(--green)' }}>Excellent</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '38%', background: 'var(--green)' }}></div></div><div className="lr-pct" style={{ color: 'var(--green)' }}>38%</div><div className="lr-count">9,124 veh</div></div>
                  <div className="lr-row"><div className="lr-band" style={{ color: 'var(--accent2)' }}>Good</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '55%', background: 'var(--accent)' }}></div></div><div className="lr-pct" style={{ color: 'var(--accent2)' }}>55%</div><div className="lr-count">6,321 veh</div></div>
                  <div className="lr-row"><div className="lr-band" style={{ color: 'var(--amber)' }}>Average</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '74%', background: 'var(--amber)' }}></div></div><div className="lr-pct" style={{ color: 'var(--amber)' }}>74%</div><div className="lr-count">3,574 veh</div></div>
                  <div className="lr-row"><div className="lr-band" style={{ color: 'var(--orange)' }}>Poor</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '92%', background: 'var(--orange)' }}></div></div><div className="lr-pct" style={{ color: 'var(--orange)' }}>92%</div><div className="lr-count">1,334 veh</div></div>
                  <div className="lr-row"><div className="lr-band" style={{ color: 'var(--red)' }}>High Risk</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '100%', background: 'linear-gradient(90deg,var(--red),#ff8080)' }}></div></div><div className="lr-pct" style={{ color: 'var(--red)' }}>118%</div><div className="lr-count">1,842 veh</div></div>
                </div>
                <div style={{ marginTop: 14, padding: 10, background: 'rgba(52,199,123,0.06)', border: '1px solid rgba(52,199,123,0.15)', borderRadius: 6, fontSize: 11, color: 'var(--text2)' }}>
                  ✦ Excellent-band vehicles show <strong style={{ color: 'var(--green)' }}>3.1× lower loss ratio</strong> than High Risk band — actuarial significance confirmed
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
                    <span style={{ fontSize: 11, background: 'rgba(52,199,123,0.1)', border: '1px solid rgba(52,199,123,0.2)', color: 'var(--green)', padding: '3px 10px', borderRadius: 20 }}>Excellent: 589</span>
                    <span style={{ fontSize: 11, background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', color: 'var(--accent2)', padding: '3px 10px', borderRadius: 20 }}>Good: 402</span>
                    <span style={{ fontSize: 11, background: 'rgba(245,83,83,0.1)', border: '1px solid rgba(245,83,83,0.2)', color: 'var(--red)', padding: '3px 10px', borderRadius: 20 }}>High Risk: 87</span>
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
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--accent2)' }}>742</td>
                      <td><span className="recent-band band-good">Good</span></td>
                      <td>2</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>0</td>
                    </tr>
                    <tr>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP14 CD 5678</td>
                      <td>Two Wheeler</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>831</td>
                      <td><span className="recent-band band-excellent">Excellent</span></td>
                      <td>0</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>0</td>
                    </tr>
                    <tr>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP80 EF 9012</td>
                      <td>Private Car</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--red)' }}>218</td>
                      <td><span className="recent-band band-high-risk">High Risk</span></td>
                      <td>9</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--red)' }}>+1,800</td>
                    </tr>
                    <tr>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP65 GH 3456</td>
                      <td>Goods Vehicle</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--amber)' }}>524</td>
                      <td><span className="recent-band band-average">Average</span></td>
                      <td>4</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--amber)' }}>+3,200</td>
                    </tr>
                    <tr>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP23 IJ 7890</td>
                      <td>Private Car</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>891</td>
                      <td><span className="recent-band band-excellent">Excellent</span></td>
                      <td>0</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>0</td>
                    </tr>
                    <tr>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP41 KL 2345</td>
                      <td>Two Wheeler</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--orange)' }}>347</td>
                      <td><span className="recent-band band-poor">Poor</span></td>
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
