// FloorPlan.jsx
// Signature element: প্রতিটা room-কে একটা box হিসেবে আঁকা হয়েছে, তার ভেতরে light bulbs আর fans।
// Light ON হলে amber glow pulse করবে, fan ON হলে blade rotate করবে — device state সরাসরি visual-এ reflect করে।

function LightIcon({ device }) {
  const isOn = device.status === "on";
  return (
    <g className={isOn ? "light-on" : "light-off"}>
      <circle r="10" className="light-glow" />
      <circle r="6" className="light-bulb" />
    </g>
  );
}

function FanIcon({ device }) {
  const isOn = device.status === "on";
  return (
    <g className={isOn ? "fan-on" : "fan-off"}>
      <circle r="12" className="fan-housing" />
      <g className="fan-blades">
        <ellipse cx="0" cy="-6" rx="3" ry="7" />
        <ellipse cx="5" cy="4" rx="3" ry="7" transform="rotate(120)" />
        <ellipse cx="-5" cy="4" rx="3" ry="7" transform="rotate(-120)" />
      </g>
    </g>
  );
}

function RoomBox({ x, y, width, height, label, devices }) {
  const lights = devices.filter((d) => d.type === "light");
  const fans = devices.filter((d) => d.type === "fan");

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={width}
        height={height}
        rx="6"
        className="room-box"
      />
      <text x={width / 2} y="18" textAnchor="middle" className="room-box-label">
        {label}
      </text>

      {/* Lights along the top */}
      {lights.map((d, i) => {
        const spacing = width / (lights.length + 1);
        return (
          <g key={d.id} transform={`translate(${spacing * (i + 1)}, 36)`}>
            <LightIcon device={d} />
          </g>
        );
      })}

      {/* Fans lower in the room */}
      {fans.map((d, i) => {
        const spacing = width / (fans.length + 1);
        return (
          <g
            key={d.id}
            transform={`translate(${spacing * (i + 1)}, ${height - 30})`}
          >
            <FanIcon device={d} />
          </g>
        );
      })}
    </g>
  );
}

export default function FloorPlan({ devices }) {
  const byRoom = (room) => devices.filter((d) => d.room === room);

  return (
    <div className="panel floorplan-panel">
      <h2 className="panel-title">Office Layout</h2>
      <svg viewBox="0 0 640 220" className="floorplan-svg">
        <RoomBox
          x={10}
          y={10}
          width={195}
          height={200}
          label="Drawing Room"
          devices={byRoom("drawing")}
        />
        <RoomBox
          x={222}
          y={10}
          width={195}
          height={200}
          label="Work Room 1"
          devices={byRoom("work1")}
        />
        <RoomBox
          x={434}
          y={10}
          width={195}
          height={200}
          label="Work Room 2"
          devices={byRoom("work2")}
        />
      </svg>
    </div>
  );
}