// status.js — !status
import { getAllDevices } from "../api/officeApi.js";
import { humanize } from "../llm/humanize.js";
import { ROOM_LABELS, summarizeRoom, groupByRoom } from "./format.js";

export async function handleStatus() {
  const devices = await getAllDevices();
  const grouped = groupByRoom(devices);

  const templateLines = Object.entries(ROOM_LABELS).map(
    ([room, label]) => `${label}: ${summarizeRoom(grouped[room] || [])}`
  );
  const fallback = templateLines.join(". ") + ".";

  const rawSnapshot = Object.entries(ROOM_LABELS).map(([room, label]) => ({
    room: label,
    summary: summarizeRoom(grouped[room] || []),
  }));

  return humanize({
    systemPrompt:
      "তুমি একটা অফিস ডিভাইস মনিটরিং বটের friendly assistant। শুধু দেওয়া ডেটা থেকে সংক্ষিপ্ত, স্পষ্ট status রিপোর্ট দাও। কোনো নতুন ফ্যাক্ট বানাবে না।",
    rawData: rawSnapshot,
    fallback,
  });
}
