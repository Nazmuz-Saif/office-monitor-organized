// alertEngine.js
// দায়িত্ব: raw device state থেকে "anomaly"গুলো বের করা। এটা pure/stateless function
// হিসেবে রাখা হয়েছে (side-effect নাই) — যাতে API আর Discord bot দুইটাই স্বাধীনভাবে
// এটাকে call করে একই লজিক পেতে পারে, কোনো duplicate কোড ছাড়াই।

import { getAllDevices, getDevicesByRoom } from "../devices/deviceStore.js";
import { ROOMS } from "../devices/deviceFactory.js";

const OFFICE_HOURS = { start: 9, end: 17 }; // 9 AM - 5 PM
const CONTINUOUS_ON_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours
const OFFICE_TIMEZONE = "Asia/Dhaka";

// server যে timezone-এই চলুক না কেন, office hours সবসময় Asia/Dhaka অনুযায়ী হিসাব হবে।
function isOutsideOfficeHours(date = new Date()) {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: OFFICE_TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(date);
  const hour = parseInt(hourStr, 10) % 24;
  return hour < OFFICE_HOURS.start || hour >= OFFICE_HOURS.end;
}

export function getActiveAlerts() {
  const alerts = [];
  const now = new Date();

  // ১. Office hours এর বাইরে কোনো ডিভাইস ON থাকলে
  if (isOutsideOfficeHours(now)) {
    const onDevices = getAllDevices().filter((d) => d.status === "on");
    for (const device of onDevices) {
      alerts.push({
        type: "after-hours",
        message: `${device.id} is ON outside office hours`,
        deviceId: device.id,
        room: device.room,
        timestamp: now.toISOString(),
      });
    }
  }

  // ২. কোনো রুমের সব ডিভাইস ২ ঘণ্টার বেশি একটানা ON থাকলে
  for (const room of ROOMS) {
    const roomDevices = getDevicesByRoom(room);
    const allOn = roomDevices.every((d) => d.status === "on");
    if (allOn) {
      const oldestChange = roomDevices.reduce((oldest, d) => {
        const t = new Date(d.lastChanged).getTime();
        return t < oldest ? t : oldest;
      }, Infinity);

      const onDurationMs = now.getTime() - oldestChange;
      if (onDurationMs >= CONTINUOUS_ON_THRESHOLD_MS) {
        alerts.push({
          type: "continuous-on",
          message: `${room} has had all devices ON for over 2 hours`,
          room,
          timestamp: now.toISOString(),
        });
      }
    }
  }

  return alerts;
}