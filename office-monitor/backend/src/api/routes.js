// routes.js
// দায়িত্ব: HTTP layer। এখানে কোনো business logic নেই — সব logic deviceStore/alertEngine-এ,
// এই ফাইল শুধু সেগুলোকে HTTP response আকারে wrap করে। এটাই সেই "shared backend"
// যা web dashboard এবং Discord bot দুইজনেই ব্যবহার করবে।

import { Router } from "express";
import {
  getAllDevices,
  getDevicesByRoom,
  getDeviceById,
  setDeviceStatus,
  getTotalPower,
  getPowerByRoom,
} from "../devices/deviceStore.js";
import { getActiveAlerts } from "../alerts/alertEngine.js";
import { ROOMS } from "../devices/deviceFactory.js";
import {
  getSimulatorState,
  setAutoRunning,
  setIntervalMs,
  MIN_INTERVAL_MS,
  MAX_INTERVAL_MS,
} from "../simulator/simulatorControl.js";

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

// ---- Manual / boss-control endpoints ----

// PATCH /api/devices/:id -> নির্দিষ্ট একটা device manually on/off করা
// body: { status: "on" | "off" }
router.patch("/devices/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== "on" && status !== "off") {
    return res.status(400).json({ error: "status must be 'on' or 'off'" });
  }

  const device = getDeviceById(id);
  if (!device) {
    return res.status(404).json({ error: `No device with id ${id}` });
  }

  const updated = setDeviceStatus(id, status);
  res.json({ device: updated });
});

// GET /api/simulator -> বর্তমান simulator settings (autoRunning, intervalMs)
router.get("/simulator", (req, res) => {
  res.json(getSimulatorState());
});

// PATCH /api/simulator -> auto-simulation চালু/বন্ধ করা, এবং/অথবা interval বদলানো
// body: { autoRunning?: boolean, intervalMs?: number }
router.patch("/simulator", (req, res) => {
  const { autoRunning, intervalMs } = req.body;

  if (autoRunning !== undefined) {
    if (typeof autoRunning !== "boolean") {
      return res.status(400).json({ error: "autoRunning must be boolean" });
    }
    setAutoRunning(autoRunning);
  }

  if (intervalMs !== undefined) {
    const parsed = Number(intervalMs);
    if (!Number.isFinite(parsed)) {
      return res.status(400).json({ error: "intervalMs must be a number" });
    }
    if (parsed < MIN_INTERVAL_MS || parsed > MAX_INTERVAL_MS) {
      return res.status(400).json({
        error: `intervalMs must be between ${MIN_INTERVAL_MS} and ${MAX_INTERVAL_MS}`,
      });
    }
    setIntervalMs(parsed);
  }

  res.json(getSimulatorState());
});

export default router;