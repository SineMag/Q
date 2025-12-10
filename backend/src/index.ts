import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { pool } from "./db/index.js";
import { initializeDatabase } from "./db/schema.js";
import patientRoutes from "./routes/patients.js";
import queueRoutes from "./routes/queue.js";
import staffRoutes from "./routes/staff.js";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";
import clinicalRoutes from "./routes/clinical.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Q Healthcare API is running" });
});

app.use("/api/patients", patientRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/clinical", clinicalRoutes);

const server = createServer(app);

const wss = new WebSocketServer({ server });

export const broadcastUpdate = (data: any) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
};

initializeDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Q Healthcare API running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket server ready for real-time updates`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });

export { app, server, wss };
