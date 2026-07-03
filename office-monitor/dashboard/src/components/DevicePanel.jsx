const ROOM_LABELS = {
  drawing: "Drawing Room",
  work1: "Work Room 1",
  work2: "Work Room 2",
};

// device chip-এ এখন click করলে toggle হয় (boss manual control) — button হিসেবে রাখা হয়েছে
// accessibility-র জন্য (keyboard focus/enter দিয়েও কাজ করবে)।
function DeviceChip({ device, onToggle }) {
  const isOn = device.status === "on";
  const label = device.id
    .split("-")
    .slice(1)
    .join(" ")
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <button
      type="button"
      className={`device-chip ${isOn ? "on" : "off"}`}
      onClick={() => onToggle(device.id, device.status)}
      title={`Click to turn ${isOn ? "off" : "on"}`}
    >
      <span className="device-dot" />
      <span className="device-label">{label}</span>
      <span className="device-watt">{isOn ? `${device.wattage}W` : "—"}</span>
    </button>
  );
}

export default function DevicePanel({ devices, onToggleDevice }) {
  const rooms = ["drawing", "work1", "work2"];

  return (
    <div className="panel device-panel">
      <h2 className="panel-title">Device Status</h2>
      <p className="panel-hint">Click any device to turn it on/off</p>
      {rooms.map((room) => {
        const roomDevices = devices.filter((d) => d.room === room);
        return (
          <div key={room} className="room-block">
            <h3 className="room-name">{ROOM_LABELS[room]}</h3>
            <div className="device-grid">
              {roomDevices.map((d) => (
                <DeviceChip key={d.id} device={d} onToggle={onToggleDevice} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
