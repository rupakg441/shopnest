import app from './app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required. Copy be/.env.example to be/.env and configure it.');
  }
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received; closing server`);
    server.close(() => process.exit(0));
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
});
