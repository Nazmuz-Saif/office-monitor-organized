import { useOfficeData } from "./hooks/useOfficeData";
import DevicePanel from "./components/DevicePanel";
import PowerMeter from "./components/PowerMeter";
import AlertsPanel from "./components/AlertsPanel";
import FloorPlan from "./components/FloorPlan";
import ControlPanel from "./components/ControlPanel";
import "./App.css";

export default function App() {
  const {
    devices,
    totalWatts,
    perRoomWatts,
    alerts,
    simulator,
    connected,
    toggleDevice,
    setAutoRunning,
    setIntervalMs,
  } = useOfficeData();

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Office Power Monitor</h1>
          <p className="subtitle">Live device &amp; energy tracking</p>
        </div>
        <div className={`conn-badge ${connected ? "live" : "down"}`}>
          <span className="conn-dot" />
          {connected ? "LIVE" : "DISCONNECTED"}
        </div>
      </header>

      <main className="app-grid">
        <div className="col-left">
          <DevicePanel devices={devices} onToggleDevice={toggleDevice} />
        </div>

        <div className="col-center">
          <FloorPlan devices={devices} />
          <AlertsPanel alerts={alerts} />
        </div>

        <div className="col-right">
          <PowerMeter totalWatts={totalWatts} perRoomWatts={perRoomWatts} />
          <ControlPanel
            simulator={simulator}
            onSetAutoRunning={setAutoRunning}
            onSetIntervalMs={setIntervalMs}
          />
        </div>
      </main>
    </div>
  );
}
