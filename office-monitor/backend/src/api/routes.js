// routes.js
// দায়িত্ব: HTTP layer। এখানে কোনো business logic নেই — সব logic deviceStore/alertEngine-এ,
// এই ফাইল শুধু সেগুলোকে HTTP response আকারে wrap করে। এটাই সেই "shared backend"
// যা web dashboard এবং Discord bot দুইজনেই ব্যবহার করবে।

import { Router } from "express";
import {
  getAllDevices,
  getDevicesByRoom,
  getTotalPower,
  getPowerByRoom,
} from "../devices/deviceStore.js";
import { getActiveAlerts } from "../alerts/alertEngine.js";
import { ROOMS } from "../devices/deviceFactory.js";

const router = Router();

// GET /api/devices -> সব ডিভাইসের বর্তমান অবস্থা
router.get("/devices", (req, res) => {
  res.json({ devices: getAllDevices() });
});

// GET /api/rooms/:roomName -> নির্দিষ্ট রুমের ডিভাইস
router.get("/rooms/:roomName", (req, res) => {
  const { roomName } = req.params;
  if (!ROOMS.includes(roomName)) {
    return res.status(404).json({ error: `Unknown room: ${roomName}` });
  }
  res.json({ room: roomName, devices: getDevicesByRoom(roomName) });
});

// GET /api/usage -> total + per-room power
router.get("/usage", (req, res) => {
  res.json({
    totalWatts: getTotalPower(),
    perRoomWatts: getPowerByRoom(),
  });
});

// GET /api/alerts -> active anomalies
router.get("/alerts", (req, res) => {
  res.json({ alerts: getActiveAlerts() });
});

export default router;