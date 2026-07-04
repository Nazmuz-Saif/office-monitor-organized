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
      "You are a friendly assistant for an office device monitoring bot. Using only the provided data, provide a concise and clear status report. Do not make up or infer any facts beyond the given data.",
    rawData: rawSnapshot,
    fallback,
  });
}
