// deviceStore.js
// এটাই আমাদের "single source of truth"। Dashboard আর Discord bot দুইটাই
// শেষ পর্যন্ত এই module-এর মধ্য দিয়েই ডেটা পায় (API/Socket লেয়ার হয়ে)।
// ইচ্ছাকৃতভাবে in-memory রাখা হয়েছে — hackathon scope-এ DB ওভারকিল।
// পরে দরকার হলে এই ফাইলের ভেতরের impl শুধু বদলালেই DB-তে migrate করা যাবে
// (বাইরের কোড deviceStore-এর function signature-এর উপর নির্ভর করে, internal storage-এর উপর না)।

import { createInitialDevices } from "./deviceFactory.js";

let devices = createInitialDevices();

// listeners: state change হলে কাকে কাকে জানাতে হবে (socket broadcaster এখানে hook করবে)
const listeners = [];

export function onChange(callback) {
  listeners.push(callback);
}

function notifyChange(changedDevice) {
  for (const cb of listeners) {
    cb(changedDevice, getAllDevices());
  }
}

export function getAllDevices() {
  return devices;
}

export function getDevicesByRoom(room) {
  return devices.filter((d) => d.room === room);
}

export function getDeviceById(id) {
  return devices.find((d) => d.id === id);
}

export function setDeviceStatus(id, status) {
  const device = devices.find((d) => d.id === id);
  if (!device) return null;

  if (device.status !== status) {
    device.status = status;
    device.lastChanged = new Date().toISOString();
    notifyChange(device);
  }
  return device;
}

export function getTotalPower() {
  return devices
    .filter((d) => d.status === "on")
    .reduce((sum, d) => sum + d.wattage, 0);
}

export function getPowerByRoom() {
  const result = {};
  for (const d of devices) {
    if (!result[d.room]) result[d.room] = 0;
    if (d.status === "on") result[d.room] += d.wattage;
  }
  return result;
}