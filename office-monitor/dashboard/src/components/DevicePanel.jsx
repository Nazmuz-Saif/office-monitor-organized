const ROOM_LABELS = {
  drawing: "Drawing Room",
  work1: "Work Room 1",
  work2: "Work Room 2",
};

function DeviceChip({ device }) {
  const isOn = device.status === "on";
  const label = device.id
    .split("-")
    .slice(1)
    .join(" ")
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className={`device-chip ${isOn ? "on" : "off"}`}>
      <span className="device-dot" />
      <span className="device-label">{label}</span>
      <span className="device-watt">{isOn ? `${device.wattage}W` : "—"}</span>
    </div>
  );
}

export default function DevicePanel({ devices }) {
  const rooms = ["drawing", "work1", "work2"];

  return (
    <div className="panel device-panel">
      <h2 className="panel-title">Device Status</h2>
      {rooms.map((room) => {
        const roomDevices = devices.filter((d) => d.room === room);
        return (
          <div key={room} className="room-block">
            <h3 className="room-name">{ROOM_LABELS[room]}</h3>
            <div className="device-grid">
              {roomDevices.map((d) => (
                <DeviceChip key={d.id} device={d} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}