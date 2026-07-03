// deviceFactory.js
// দায়িত্ব: শুধু ১৮টা ডিভাইসের initial list বানানো। এখানে কোনো state-mutation লজিক নেই,
// যাতে "who creates devices" আর "who owns runtime state" আলাদা থাকে (single responsibility)।

const ROOMS = ["drawing", "work1", "work2"];

const WATTAGE = {
  fan: 60,
  light: 15,
};

export function createInitialDevices() {
  const devices = [];
  const now = new Date().toISOString();

  for (const room of ROOMS) {
    // প্রতি রুমে ২টা fan
    for (let i = 1; i <= 2; i++) {
      devices.push({
        id: `${room}-fan-${i}`,
        type: "fan",
        room,
        status: "off",
        wattage: WATTAGE.fan,
        lastChanged: now,
      });
    }
    // প্রতি রুমে ৩টা light
    for (let i = 1; i <= 3; i++) {
      devices.push({
        id: `${room}-light-${i}`,
        type: "light",
        room,
        status: "off",
        wattage: WATTAGE.light,
        lastChanged: now,
      });
    }
  }

  return devices;
}

export { ROOMS, WATTAGE };