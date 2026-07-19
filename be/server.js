import app from './app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejections: ${err.message}`);
  // Close server and exit process
  server.close(() => process.exit(1));
});
