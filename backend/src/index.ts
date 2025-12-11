import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

if (!process.env.JWT_SECRET) {
  logger.error("JWT_SECRET environment variable is required");
  process.exit(1);
}

app.use(helmet());

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Q Healthcare API is running" });
});

app.use("/api/patients", patientRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/clinical", clinicalRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

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
      logger.info(`Q Healthcare API running on port ${PORT}`, {
        nodeEnv: process.env.NODE_ENV,
        port: PORT,
      });
      logger.info('WebSocket server ready for real-time updates');
    });
  })
  .catch((error) => {
    logger.error("Failed to initialize database", error);
    process.exit(1);
  });

export { app, server, wss };
