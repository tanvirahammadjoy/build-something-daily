import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { connectSocket, disconnectSocket } from '../lib/socket';

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return;
    }

    // Reconnects with the current token whenever it changes (e.g. after a
    // silent refresh) — this effect re-runs because accessToken is a dependency.
    const socket = connectSocket(accessToken);

    const invalidateTasks = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    };
    const invalidateNotifications = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('task:created', invalidateTasks);
    socket.on('task:updated', invalidateTasks);
    socket.on('task:deleted', invalidateTasks);
    socket.on('notification:new', invalidateNotifications);

    return () => {
      socket.off('task:created', invalidateTasks);
      socket.off('task:updated', invalidateTasks);
      socket.off('task:deleted', invalidateTasks);
      socket.off('notification:new', invalidateNotifications);
    };
  }, [accessToken, queryClient]);
}
