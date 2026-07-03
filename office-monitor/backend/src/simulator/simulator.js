// simulator.js
// দায়িত্ব: শুধু "fake reality" তৈরি করা — device state store-কে সরাসরি না ছুঁয়ে
// শুধু deviceStore-এর exposed function (setDeviceStatus) ব্যবহার করে।
// এতে simulator বদলে ফেললে (বা future-এ real hardware দিয়ে replace করলে)
// বাকি কোড (API, socket, bot) একটুও বদলাতে হবে না।

import { getAllDevices, setDeviceStatus } from "../devices/deviceStore.js";

const TOGGLE_INTERVAL_MS = 7000; // প্রতি ৭ সেকেন্ডে
const MIN_TOGGLES = 1;
const MAX_TOGGLES = 3;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomDevices(devices, count) {
  const shuffled = [...devices].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function startSimulator() {
  const intervalId = setInterval(() => {
    const devices = getAllDevices();
    const toggleCount = randomInt(MIN_TOGGLES, MAX_TOGGLES);
    const targets = pickRandomDevices(devices, toggleCount);

    for (const device of targets) {
      const newStatus = device.status === "on" ? "off" : "on";
      setDeviceStatus(device.id, newStatus);
    }
  }, TOGGLE_INTERVAL_MS);

  return () => clearInterval(intervalId); // caller চাইলে simulator বন্ধ করতে পারবে (testing-এর জন্য useful)
}