// simulatorControl.js
// দায়িত্ব: simulator-এর "settings" রাখা (auto-run চালু আছে কিনা, কত সেকেন্ড পরপর টগল হবে)।
// এটা deviceStore থেকে আলাদা রাখা হয়েছে কারণ এটা device-এর data না, বরং
// simulation-এর behavior/config — অন্য concern, তাই অন্য module।

const DEFAULT_INTERVAL_MS = 7000;
const MIN_INTERVAL_MS = 1000; // 1s এর কমে allow করছি না, নাহলে UI/network flood হবে
const MAX_INTERVAL_MS = 60000; // 60s এর বেশি লাগলে কার্যত "off"-এর মতোই, তাই cap

let state = {
  autoRunning: true,
  intervalMs: DEFAULT_INTERVAL_MS,
};

const listeners = [];

export function onControlChange(callback) {
  listeners.push(callback);
}

function notify() {
  for (const cb of listeners) cb(getSimulatorState());
}

export function getSimulatorState() {
  return { ...state };
}

export function setAutoRunning(isRunning) {
  state.autoRunning = Boolean(isRunning);
  notify();
  return getSimulatorState();
}

export function setIntervalMs(ms) {
  const clamped = Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, ms));
  state.intervalMs = clamped;
  notify();
  return getSimulatorState();
}

export { MIN_INTERVAL_MS, MAX_INTERVAL_MS };
