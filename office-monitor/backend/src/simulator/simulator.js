// simulator.js
// দায়িত্ব: শুধু "fake reality" তৈরি করা — device state store-কে সরাসরি না ছুঁয়ে
// শুধু deviceStore-এর exposed function (setDeviceStatus) ব্যবহার করে।
// এতে simulator বদলে ফেললে (বা future-এ real hardware দিয়ে replace করলে)
// বাকি কোড (API, socket, bot) একটুও বদলাতে হবে না।
//
// এই ভার্সনে simulatorControl-এর state (autoRunning, intervalMs) respect করা হয়:
// - autoRunning false হলে কোনো auto-toggle হবে না (boss manual control নেবে)
// - intervalMs বদলালে timer নিজে থেকে restart হয়ে নতুন interval-এ চলবে

import { getAllDevices, setDeviceStatus } from "../devices/deviceStore.js";
import { getSimulatorState, onControlChange } from "./simulatorControl.js";

const MIN_TOGGLES = 1;
const MAX_TOGGLES = 3;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomDevices(devices, count) {
  const shuffled = [...devices].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function runToggleTick() {
  const devices = getAllDevices();
  const toggleCount = randomInt(MIN_TOGGLES, MAX_TOGGLES);
  const targets = pickRandomDevices(devices, toggleCount);

  for (const device of targets) {
    const newStatus = device.status === "on" ? "off" : "on";
    setDeviceStatus(device.id, newStatus);
  }
}

export function startSimulator() {
  let intervalId = null;

  function startTimer() {
    const { intervalMs } = getSimulatorState();
    intervalId = setInterval(() => {
      const { autoRunning } = getSimulatorState();
      if (autoRunning) runToggleTick();
    }, intervalMs);
  }

  function restartTimer() {
    if (intervalId) clearInterval(intervalId);
    startTimer();
  }

  startTimer();

  // intervalMs বদলালে timer পুনরায় ঠিক নতুন interval-এ শুরু করতে হবে
  // (autoRunning টগলের জন্য restart লাগবে না, উপরের tick-এর ভেতরেই চেক হয়)
  let lastIntervalMs = getSimulatorState().intervalMs;
  onControlChange((newState) => {
    if (newState.intervalMs !== lastIntervalMs) {
      lastIntervalMs = newState.intervalMs;
      restartTimer();
    }
  });

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}
