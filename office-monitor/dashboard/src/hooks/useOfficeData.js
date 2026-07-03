import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:4000";

// দায়িত্ব: শুধু socket connection ধরে রাখা, সবচেয়ে সাম্প্রতিক snapshot ফেরত দেওয়া,
// আর boss-control-এর জন্য কয়েকটা action function (toggleDevice, setAutoRunning, setIntervalMs)
// এক্সপোজ করা। এই ফাইলে কোনো UI নেই — pure data + actions hook।
export function useOfficeData() {
  const [devices, setDevices] = useState([]);
  const [totalWatts, setTotalWatts] = useState(0);
  const [perRoomWatts, setPerRoomWatts] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [simulator, setSimulator] = useState({ autoRunning: true, intervalMs: 7000 });
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    function applySnapshot(payload) {
      setDevices(payload.devices);
      setTotalWatts(payload.totalWatts);
      setPerRoomWatts(payload.perRoomWatts);
      setAlerts(payload.alerts);
      if (payload.simulator) setSimulator(payload.simulator);
    }

    socket.on("snapshot", applySnapshot);
    socket.on("deviceUpdate", applySnapshot);

    return () => socket.disconnect();
  }, []);

  // এই action গুলো সরাসরি REST API কল করে — socket শুধু broadcast-এর জন্য, mutation-এর জন্য না।
  // Backend-এ change হলে সব client (এই ট্যাব সহ) socket broadcast থেকেই updated state পাবে,
  // তাই এখানে optimistic local state update করার দরকার নেই।

  const toggleDevice = useCallback(async (deviceId, currentStatus) => {
    const newStatus = currentStatus === "on" ? "off" : "on";
    await fetch(`${BACKEND_URL}/api/devices/${deviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }, []);

  const setAutoRunning = useCallback(async (isRunning) => {
    await fetch(`${BACKEND_URL}/api/simulator`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoRunning: isRunning }),
    });
  }, []);

  const setIntervalMs = useCallback(async (ms) => {
    await fetch(`${BACKEND_URL}/api/simulator`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intervalMs: ms }),
    });
  }, []);

  return {
    devices,
    totalWatts,
    perRoomWatts,
    alerts,
    simulator,
    connected,
    toggleDevice,
    setAutoRunning,
    setIntervalMs,
  };
}
