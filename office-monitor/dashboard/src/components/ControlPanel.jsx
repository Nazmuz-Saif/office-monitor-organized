// ControlPanel.jsx
// দায়িত্ব: boss-facing controls — auto-simulation চালু/বন্ধ, আর কত সেকেন্ড পরপর
// random toggle হবে সেটা ঠিক করা। এখানে কোনো device-level logic নেই, শুধু
// simulator-এর global settings নিয়ন্ত্রণ করে (useOfficeData hook-এর মাধ্যমে backend-এ পাঠায়)।

const PRESETS_SEC = [3, 5, 7, 10, 15, 30];

export default function ControlPanel({ simulator, onSetAutoRunning, onSetIntervalMs }) {
  const currentSec = Math.round(simulator.intervalMs / 1000);

  return (
    <div className="panel control-panel">
      <h2 className="panel-title">Simulation Control</h2>

      <div className="control-row">
        <span className="control-label">Auto simulation</span>
        <button
          type="button"
          className={`toggle-switch ${simulator.autoRunning ? "active" : ""}`}
          onClick={() => onSetAutoRunning(!simulator.autoRunning)}
          aria-pressed={simulator.autoRunning}
        >
          <span className="toggle-knob" />
        </button>
      </div>
      <p className="control-note">
        {simulator.autoRunning
          ? "Devices toggle automatically. Turn this off to control everything manually."
          : "Auto-toggle is paused — only manual clicks change device state."}
      </p>

      <div className="control-row speed-row">
        <span className="control-label">Toggle every</span>
        <span className="speed-value">{currentSec}s</span>
      </div>
      <input
        type="range"
        min="1"
        max="60"
        value={currentSec}
        disabled={!simulator.autoRunning}
        onChange={(e) => onSetIntervalMs(Number(e.target.value) * 1000)}
        className="speed-slider"
      />
      <div className="speed-presets">
        {PRESETS_SEC.map((sec) => (
          <button
            key={sec}
            type="button"
            className={`preset-btn ${currentSec === sec ? "active" : ""}`}
            disabled={!simulator.autoRunning}
            onClick={() => onSetIntervalMs(sec * 1000)}
          >
            {sec}s
          </button>
        ))}
      </div>
    </div>
  );
}
