import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { pool } from './db/index.js';
import { initializeDatabase } from './db/schema.js';
import patientRoutes from './routes/patients.js';
import queueRoutes from './routes/queue.js';
import staffRoutes from './routes/staff.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Q Healthcare API is running' });
});

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/staff', staffRoutes);

// Create HTTP server
const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

// Broadcast function to send updates to all connected clients
export const broadcastUpdate = (data: any) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(data));
    }
  });
};

// Initialize database and start server
initializeDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Q Healthcare API running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket server ready for real-time updates`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

export { app, server, wss };

