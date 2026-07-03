// room.js — !room <name>
import { getRoomDevices } from "../api/officeApi.js";
import { humanize } from "../llm/humanize.js";
import { ROOM_LABELS, summarizeRoom } from "./format.js";

const VALID_ROOMS = Object.keys(ROOM_LABELS);

export async function handleRoom(roomArg) {
  const room = (roomArg || "").toLowerCase().trim();

  if (!VALID_ROOMS.includes(room)) {
    return `রুম "${roomArg}" খুঁজে পাইনি। Valid রুম: ${VALID_ROOMS.join(", ")} (যেমন: \`!room work1\`)`;
  }

  const { devices } = await getRoomDevices(room);
  const label = ROOM_LABELS[room];
  const summary = summarizeRoom(devices);
  const fallback = `${label}: ${summary}.`;

  const deviceDetail = devices.map((d) => ({
    id: d.id,
    type: d.type,
    status: d.status,
    wattage: d.status === "on" ? d.wattage : 0,
  }));

  return humanize({
    systemPrompt:
      "তুমি একটা অফিস ডিভাইস মনিটরিং বটের friendly assistant। শুধু দেওয়া ডেটা থেকে একটা নির্দিষ্ট রুমের status সংক্ষেপে বলো।",
    rawData: { room: label, devices: deviceDetail },
    fallback,
  });
}
