export default function StaticPage() {
  const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #1a1a1a; color: white; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    header { background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    h1 { color: #4dabf7; margin-bottom: 10px; }
    .card { background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .stat { background: #3a3a3a; padding: 15px; border-radius: 8px; text-align: center; }
    .stat h3 { color: #888; font-size: 14px; margin-bottom: 10px; }
    .stat p { font-size: 24px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #444; }
    th { background: #333; color: #888; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="container">
        <header>
          <h1>CRM Static Test</h1>
          <p>Pure HTML + CSS - No JavaScript</p>
        </header>
        
        <div className="card">
          <h2>Dashboard Stats</h2>
          <div className="stats">
            <div className="stat">
              <h3>Total Leads</h3>
              <p>42</p>
            </div>
            <div className="stat">
              <h3>Closed Deals</h3>
              <p style={{ color: '#4CAF50' }}>18</p>
            </div>
            <div className="stat">
              <h3>Revenue</h3>
              <p style={{ color: '#4CAF50' }}>€24,500</p>
            </div>
            <div className="stat">
              <h3>ROI</h3>
              <p>156%</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2>Recent Sales</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Closer</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-02-20</td>
                <td>Alex</td>
                <td>€5,000</td>
                <td>Full</td>
                <td style={{ color: '#4CAF50' }}>✅ Closed</td>
              </tr>
              <tr>
                <td>2024-02-19</td>
                <td>Niklas</td>
                <td>€3,000</td>
                <td>Installment</td>
                <td style={{ color: '#4CAF50' }}>✅ Closed</td>
              </tr>
              <tr>
                <td>2024-02-18</td>
                <td>Alex</td>
                <td>€2,000</td>
                <td>Full</td>
                <td style={{ color: '#FF9800' }}>⚠️ No Show</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="card">
          <p><strong>Note:</strong> This is a static HTML page with inline CSS. No JavaScript, React, or Tailwind.</p>
          <p>If you can see this, the server is working but JavaScript may be blocked or failing.</p>
        </div>
      </div>
    </>
  );
}
