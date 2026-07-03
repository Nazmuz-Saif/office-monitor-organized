// server.js
// Entry point। এখানে শুধু "wiring" হয় — কোনো business logic নেই।

import express from "express";
import cors from "cors";
import { createServer } from "http";

import apiRoutes from "./api/routes.js";
import { attachSocketServer } from "./socket/socketServer.js";
import { startSimulator } from "./simulator/simulator.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Office Monitor backend running" });
});

const httpServer = createServer(app);
attachSocketServer(httpServer);
startSimulator();

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});