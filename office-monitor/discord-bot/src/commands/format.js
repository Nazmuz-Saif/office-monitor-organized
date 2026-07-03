// format.js
// দায়িত্ব: device list থেকে "X fan ON, Y light ON" স্টাইলের plain-text summary বানানো।
// status.js এবং room.js দুটোই এই একই function ব্যবহার করে, কোনো duplicate লজিক নেই।

export const ROOM_LABELS = {
  drawing: "Drawing Room",
  work1: "Work Room 1",
  work2: "Work Room 2",
};

export function summarizeRoom(roomDevices) {
  const fansOn = roomDevices.filter((d) => d.type === "fan" && d.status === "on").length;
  const lightsOn = roomDevices.filter((d) => d.type === "light" && d.status === "on").length;

  if (fansOn === 0 && lightsOn === 0) return "all off";

  const parts = [];
  if (fansOn > 0) parts.push(`${fansOn} fan${fansOn > 1 ? "s" : ""} ON`);
  if (lightsOn > 0) parts.push(`${lightsOn} light${lightsOn > 1 ? "s" : ""} ON`);
  return parts.join(", ");
}

export function groupByRoom(devices) {
  const grouped = {};
  for (const d of devices) {
    if (!grouped[d.room]) grouped[d.room] = [];
    grouped[d.room].push(d);
  }
  return grouped;
}
