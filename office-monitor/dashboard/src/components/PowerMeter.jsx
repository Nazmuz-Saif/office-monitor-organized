const ROOM_LABELS = {
  drawing: "Drawing Room",
  work1: "Work Room 1",
  work2: "Work Room 2",
};

export default function PowerMeter({ totalWatts, perRoomWatts }) {
  const maxPossible = 18 * 60; // worst case সব device fan হলে (রুক্ষ upper bound, বার চার্টের scale-এর জন্য)

  return (
    <div className="panel power-panel">
      <h2 className="panel-title">Power Consumption</h2>
      <div className="total-reading">
        <span className="total-value">{totalWatts}</span>
        <span className="total-unit">W</span>
      </div>
      <div className="room-bars">
        {Object.entries(ROOM_LABELS).map(([room, label]) => {
          const watts = perRoomWatts[room] || 0;
          const pct = Math.min(100, (watts / maxPossible) * 100);
          return (
            <div key={room} className="room-bar-row">
              <span className="room-bar-label">{label}</span>
              <div className="room-bar-track">
                <div
                  className="room-bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="room-bar-value">{watts}W</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}