import app from './app.js';
import { connectDatabase } from './config/database.js';
import mongoose from 'mongoose';

const port = process.env.PORT || 5000;
let server;

const startServer = async () => {
  await connectDatabase();
  server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully.`);
  server?.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exitCode = 1;
});
