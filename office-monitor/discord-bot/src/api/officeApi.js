// officeApi.js
// দায়িত্ব: শুধু backend-এর REST API hit করা। এখানে কোনো business logic নেই।
// এটাই আর্কিটেকচার রিকোয়ারমেন্ট মেইনটেইন করে — bot কখনোই DB সরাসরি ছোঁয় না,
// dashboard যেভাবে ডেটা পায় (backend API), bot-ও ঠিক সেভাবেই পায়। একই source of truth.

import "dotenv/config";
import fetch from "node-fetch";

const BASE_URL = process.env.BACKEND_URL || "http://localhost:4000";

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Backend ${path} responded ${res.status}`);
  }
  return res.json();
}

export function getAllDevices() {
  return get("/api/devices").then((d) => d.devices);
}

export function getRoomDevices(roomName) {
  return get(`/api/rooms/${roomName}`);
}

export function getUsage() {
  return get("/api/usage");
}

export function getAlerts() {
  return get("/api/alerts").then((d) => d.alerts);
}
