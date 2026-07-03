import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:4000";

// দায়িত্ব: শুধু socket connection ধরে রাখা আর সবচেয়ে সাম্প্রতিক snapshot ফেরত দেওয়া।
// কোনো component-এর UI logic এখানে নেই — pure data hook।
export function useOfficeData() {
  const [devices, setDevices] = useState([]);
  const [totalWatts, setTotalWatts] = useState(0);
  const [perRoomWatts, setPerRoomWatts] = useState({});
  const [alerts, setAlerts] = useState([]);
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
    }

    socket.on("snapshot", applySnapshot);
    socket.on("deviceUpdate", applySnapshot);

    return () => socket.disconnect();
  }, []);

  return { devices, totalWatts, perRoomWatts, alerts, connected };
}