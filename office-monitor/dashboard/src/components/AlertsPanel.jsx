function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  });
}

export default function AlertsPanel({ alerts }) {
  return (
    <div className="panel alerts-panel">
      <h2 className="panel-title">Active Alerts</h2>
      {alerts.length === 0 ? (
        <p className="no-alerts">No anomalies detected. All clear.</p>
      ) : (
        <ul className="alert-list">
          {alerts.map((alert, idx) => (
            <li key={idx} className="alert-item">
              <span className="alert-time">{formatTime(alert.timestamp)}</span>
              <span className="alert-message">{alert.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}