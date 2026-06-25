const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./realtime/socket');
const { startNotificationScheduler } = require('./jobs/notificationScheduler');

const PORT = process.env.PORT || 5000;

// A bug in some unrelated background code (a missed .catch() in the cron
// job, a stray promise in a socket handler) shouldn't be able to crash the
// whole process silently. Log it with context and exit deliberately —
// "fail loudly and stop" beats "keep running in a broken state."
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);
  startNotificationScheduler();

  server.listen(PORT, () => {
    console.log(`TaskFlow API running on port ${PORT}`);
  });
};

startServer();
