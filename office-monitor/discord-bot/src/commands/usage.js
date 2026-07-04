// usage.js — !usage
// নোট: backend historical usage track করে না (in-memory, snapshot-only), তাই
// "today's estimated usage" একটা approximation — ধরে নিচ্ছি বর্তমান load-টা
// আজকের মধ্যরাত থেকে গড়ে একই রকম ছিল। Real historical logging DB লাগবে,
// hackathon scope-এ এটা যথেষ্ট, কিন্তু ইউজারকে approximation বলে জানানো উচিত।

import { getUsage } from "../api/officeApi.js";
import { humanize } from "../llm/humanize.js";

const OFFICE_TIMEZONE = "Asia/Dhaka";

function hoursSinceMidnight(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: OFFICE_TIMEZONE,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour").value) % 24;
  const minute = Number(parts.find((p) => p.type === "minute").value);
  return hour + minute / 60;
}

export async function handleUsage() {
  const { totalWatts, perRoomWatts } = await getUsage();
  const hoursElapsed = hoursSinceMidnight();
  const estimatedKWh = ((totalWatts / 1000) * hoursElapsed).toFixed(1);

  const fallback = `Total power right now: ${totalWatts}W. Today's estimated usage (approx.): ${estimatedKWh} kWh.`;

  return humanize({
    systemPrompt:
      "You are a friendly assistant for an office power monitoring bot. Using only the provided data, generate a concise power usage report. Clearly state that the estimated kWh value is an approximation and should not be treated as an exact measurement. Do not make up or infer any facts beyond the given data.",
    rawData: { totalWatts, perRoomWatts, estimatedKWh, hoursElapsedToday: hoursElapsed.toFixed(1) },
    fallback,
  });
}
