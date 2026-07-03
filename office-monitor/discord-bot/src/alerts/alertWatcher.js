// alertWatcher.js
// দায়িত্ব: প্রতি কয়েক সেকেন্ডে /api/alerts poll করা এবং নতুন alert পেলে
// designated channel-এ proactively message পাঠানো (bonus requirement)।
//
// Trade-off: backend থেকে real-time push (Socket.io) নেওয়া আরও efficient হতো,
// কিন্তু bot-কে backend-এর সাথে একই "shared REST API" contract-এ রাখতে polling
// বেছে নিয়েছি — bot কখনো socket/DB internals-এর উপর নির্ভর করে না, শুধু public API-তে।
// Dedup: alert-এর (type+deviceId/room+timestamp-এর মিনিট পর্যন্ত) key দিয়ে "already seen"
// ট্র্যাক করা হয়, যাতে একই alert বারবার spam না হয়।

import { getAlerts } from "../api/officeApi.js";

const POLL_INTERVAL_MS = 15000;
const seenAlertKeys = new Set();

function alertKey(alert) {
  // মিনিট পর্যন্ত timestamp রাউন্ড করে key বানাই, যাতে একই condition বারবার fire
  // করলেও (poll প্রতি রান-এ recompute হয় বলে) duplicate spam না হয়।
  const minuteBucket = alert.timestamp.slice(0, 16); // "YYYY-MM-DDTHH:MM"
  return `${alert.type}:${alert.deviceId || alert.room}:${minuteBucket}`;
}

export function startAlertWatcher(client, channelId) {
  if (!channelId) {
    console.warn("[alertWatcher] ALERT_CHANNEL_ID সেট নেই — proactive alert বন্ধ থাকবে।");
    return () => {};
  }

  const intervalId = setInterval(async () => {
    try {
      const alerts = await getAlerts();
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel) return;

      for (const alert of alerts) {
        const key = alertKey(alert);
        if (seenAlertKeys.has(key)) continue;
        seenAlertKeys.add(key);
        await channel.send(`⚠️ Hey! ${alert.message}. Did someone forget to turn it off?`);
      }
    } catch (err) {
      console.error("[alertWatcher] poll failed:", err.message);
    }
  }, POLL_INTERVAL_MS);

  return () => clearInterval(intervalId);
}
