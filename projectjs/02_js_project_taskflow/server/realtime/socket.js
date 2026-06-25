const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

// Authenticates each socket connection using the SAME short-lived access
// token the REST API uses, sent via the connection handshake (sockets don't
// automatically carry httpOnly cookies the way fetch does, so this stays
// consistent with the Authorization-header pattern used everywhere else).
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Unauthorized: no token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.sub;
      next();
    } catch (err) {
      next(new Error('Unauthorized: invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    // Every device/tab for a given user joins the same room, so emitting
    // once to the room reaches all of that user's open sessions without the
    // server needing to track individual socket IDs itself.
    socket.join(`user:${socket.userId}`);
  });

  return io;
}

// Used by controllers/jobs to push an event to every connected session for
// one user. No-ops safely if socket.io hasn't been initialized (e.g. tests).
function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

function getIO() {
  return io;
}

module.exports = { initSocket, emitToUser, getIO };
