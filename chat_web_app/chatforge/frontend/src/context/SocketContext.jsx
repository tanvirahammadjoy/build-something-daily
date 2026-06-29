import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Create or tear down the connection whenever auth state changes
  useEffect(() => {
    if (!user) {
      setSocket(null);
      return;
    }

    // withCredentials lets the browser attach the httpOnly auth cookie to the
    // handshake - the backend's socketAuthMiddleware reads it from there.
    const newSocket = io('/', { withCredentials: true });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user]);

  // Track connect/disconnect state for whichever socket is currently active
  useEffect(() => {
    if (!socket) {
      setConnected(false);
      return;
    }
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside a SocketProvider');
  return ctx;
};
