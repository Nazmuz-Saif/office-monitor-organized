// socketServer.js
// দায়িত্ব: deviceStore বা simulator-control-এ change হলে সাথে সাথে সব connected
// client (dashboard)-কে push করা। এটাই "no manual page refresh" রিকোয়ারমেন্ট পূরণ করে।

import { Server } from "socket.io";
import { onChange, getAllDevices, getTotalPower, getPowerByRoom } from "../devices/deviceStore.js";
import { getActiveAlerts } from "../alerts/alertEngine.js";
import { getSimulatorState, onControlChange } from "../simulator/simulatorControl.js";

function buildSnapshot() {
  return {
    devices: getAllDevices(),
    totalWatts: getTotalPower(),
    perRoomWatts: getPowerByRoom(),
    alerts: getActiveAlerts(),
    simulator: getSimulatorState(),
  };
}

export function attachSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" }, // hackathon scope; production-এ specific origin দেওয়া উচিত
  });

  io.on("connection", (socket) => {
    // নতুন client কানেক্ট হলে সাথে সাথে current snapshot পাঠাও
    socket.emit("snapshot", buildSnapshot());
  });

  // deviceStore-এ যেকোনো পরিবর্তন হলে সব client-কে broadcast করো
  onChange(() => {
    io.emit("deviceUpdate", buildSnapshot());
  });

  // simulator settings (auto on/off, interval) বদলালেও broadcast করো,
  // যাতে boss-এর control panel সব browser tab-এ sync থাকে
  onControlChange(() => {
    io.emit("deviceUpdate", buildSnapshot());
  });

  return io;
}
