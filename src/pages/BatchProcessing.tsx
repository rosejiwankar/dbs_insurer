export default function BatchProcessing() {
  return (
    <div className="batch-layout">
      <div>
        <div className="card">
          <div className="card-title">Upload Vehicle List</div>
          <div className="upload-zone">
            <div className="upload-icon">??</div>
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
          <button className="export-btn">? Export CSV</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Registration No.</th>
              <th>Vehicle Type</th>
              <th>DBS Score</th>
              <th>Band</th>
              <th>Violations</th>
              <th>TP Loading (?)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP32 AB 1234</td><td>Private Car</td><td style={{ fontFamily: 'DM Mono, monospace', color: '#22c55e' }}>252</td><td><span className="recent-band band-average">Average</span></td><td>2</td><td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>0</td></tr>
            <tr><td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP14 CD 5678</td><td>Two Wheeler</td><td style={{ fontFamily: 'DM Mono, monospace', color: '#059669' }}>294</td><td><span className="recent-band band-exemplary">Exemplary</span></td><td>0</td><td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>0</td></tr>
            <tr><td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP80 EF 9012</td><td>Private Car</td><td style={{ fontFamily: 'DM Mono, monospace', color: '#ef4444' }}>165</td><td><span className="recent-band band-high-risk">High Risk</span></td><td>9</td><td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--red)' }}>+1,800</td></tr>
            <tr><td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP65 GH 3456</td><td>Goods Vehicle</td><td style={{ fontFamily: 'DM Mono, monospace', color: '#f97316' }}>198</td><td><span className="recent-band band-at-risk">At Risk</span></td><td>4</td><td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--amber)' }}>+3,200</td></tr>
            <tr><td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP23 IJ 7890</td><td>Private Car</td><td style={{ fontFamily: 'DM Mono, monospace', color: '#16a34a' }}>276</td><td><span className="recent-band band-responsible">Responsible</span></td><td>0</td><td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>0</td></tr>
            <tr><td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>UP41 KL 2345</td><td>Two Wheeler</td><td style={{ fontFamily: 'DM Mono, monospace', color: '#b91c1c' }}>108</td><td><span className="recent-band band-chronic-violator">Chronic Violator</span></td><td>6</td><td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--orange)' }}>+380</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}