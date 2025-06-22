import dotenv from 'dotenv';
import app from './app.mjs';
import { setupWebSocket } from './websocket.mjs';
import { connectDB } from '../config/db.mjs';

const PORT = process.env.PORT || 3010;
const PEERS = process.env.PEERS ? process.env.PEERS.split(',') : [];

dotenv.config();

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Servern är startad på adress http://localhost:${PORT} och kör i läget ${process.env.NODE_ENV}`
    );
    setupWebSocket(Number(PORT) + 1, PEERS);
  });
});