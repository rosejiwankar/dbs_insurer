export default function APIConsole() {
  return (
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
  );
}