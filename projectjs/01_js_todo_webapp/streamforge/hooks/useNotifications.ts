"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { NotificationWithRelations } from "@/types/notification";

interface NotificationState { notifications: NotificationWithRelations[]; unreadCount: number; connected: boolean; }

export function useNotifications(isLoggedIn: boolean) {
  const [state, setState] = useState<NotificationState>({ notifications: [], unreadCount: 0, connected: false });
  const esRef = useRef<EventSource | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setState((prev) => ({ ...prev, notifications: data.notifications, unreadCount: data.unreadCount }));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    setState((prev) => ({ ...prev, unreadCount: 0, notifications: prev.notifications.map((n) => ({ ...n, read: true })) }));
    await fetch("/api/notifications", { method: "PATCH" }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchNotifications();
    const es = new EventSource("/api/notifications/stream");
    esRef.current = es;

    es.addEventListener("open", () => setState((prev) => ({ ...prev, connected: true })));
    es.addEventListener("unread_count", (e) => { const { count } = JSON.parse(e.data); setState((prev) => ({ ...prev, unreadCount: count })); });
    es.addEventListener("new_notifications", (e) => {
      const { notifications: newOnes } = JSON.parse(e.data);
      setState((prev) => ({
        ...prev,
        notifications: [...newOnes, ...prev.notifications.filter((n) => !newOnes.find((nn: NotificationWithRelations) => nn.id === n.id))].slice(0, 20),
      }));
    });
    es.addEventListener("error", () => setState((prev) => ({ ...prev, connected: false })));

    return () => { es.close(); esRef.current = null; };
  }, [isLoggedIn, fetchNotifications]);

  return { ...state, fetchNotifications, markAllRead };
}
