// humanize.js
// দায়িত্ব: raw data-কে friendly sentence-এ রূপান্তর করা। LLM শুধু phrasing করে —
// numbers/facts সবসময় আসে actual simulated state থেকে, LLM কখনো data বানায় না
// (prompt-এ raw JSON snapshot হিসেবে দিয়ে দেই, "শুধু এই তথ্য নিয়ে লেখো" বলে)।
//
// Trade-off: LLM call latency + external dependency যোগ করে, তাই GROQ_API_KEY
// না থাকলে বা call fail করলে আমরা silently deterministic template-এ fallback করি —
// demo চলাকালীন internet/Groq down থাকলেও bot কখনো crash করবে না।

import "dotenv/config";
import fetch from "node-fetch";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(systemPrompt, rawDataJson) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `এই JSON snapshot অনুযায়ী ১-২ বাক্যে friendly, conversational English/Banglish রিপোর্ট লেখো। শুধু এই ডেটা ব্যবহার করবে, নতুন কোনো সংখ্যা/নাম বানাবে না:\n${JSON.stringify(
            rawDataJson
          )}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 200,
    }),
  });

  if (!res.ok) throw new Error(`Groq responded ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
}

// প্রতিটা caller (status/room/usage) নিজের template fallback আর system prompt পাঠায়
export async function humanize({ systemPrompt, rawData, fallback }) {
  if (!GROQ_API_KEY) return fallback;
  try {
    const text = await callGroq(systemPrompt, rawData);
    return text || fallback;
  } catch (err) {
    console.error("[humanize] Groq call failed, falling back to template:", err.message);
    return fallback;
  }
}
