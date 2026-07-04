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
          content: `Using only the provided JSON snapshot, give a friendly, conversational report in English in 1–2 sentences. Do not introduce any new numbers, names, or assumptions beyond the given data.:\n${JSON.stringify(
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
