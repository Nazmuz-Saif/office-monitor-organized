// socketServer.js
// দায়িত্ব: deviceStore-এ change হলে সাথে সাথে সব connected client (dashboard)-কে push করা।
// এটাই "no manual page refresh" রিকোয়ারমেন্ট পূরণ করে।

import { Server } from "socket.io";
import { onChange, getAllDevices, getTotalPower, getPowerByRoom } from "../devices/deviceStore.js";
import { getActiveAlerts } from "../alerts/alertEngine.js";

export function attachSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" }, // hackathon scope; production-এ specific origin দেওয়া উচিত
  });

  io.on("connection", (socket) => {
    // নতুন client কানেক্ট হলে সাথে সাথে current snapshot পাঠাও
    socket.emit("snapshot", {
      devices: getAllDevices(),
      totalWatts: getTotalPower(),
      perRoomWatts: getPowerByRoom(),
      alerts: getActiveAlerts(),
    });
  });

  // deviceStore-এ যেকোনো পরিবর্তন হলে সব client-কে broadcast করো
  onChange((changedDevice, allDevices) => {
    io.emit("deviceUpdate", {
      changedDevice,
      devices: allDevices,
      totalWatts: getTotalPower(),
      perRoomWatts: getPowerByRoom(),
      alerts: getActiveAlerts(),
    });
  });

  return io;
}