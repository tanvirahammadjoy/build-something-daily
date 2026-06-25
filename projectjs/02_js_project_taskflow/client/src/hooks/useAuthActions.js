import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { applyUserTheme } from '../store/themeStore';
import { useToast } from '../context/ToastContext';

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await api.post('/auth/login', { email, password });
      return data;
    },
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.user, data.accessToken);
      applyUserTheme(data.user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async ({ name, email, password }) => {
      const { data } = await api.post('/auth/register', { name, email, password });
      return data;
    },
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.user, data.accessToken);
      applyUserTheme(data.user);
    },
  });
}

export function useUpdatePreferences() {
  return useMutation({
    mutationFn: async (preferences) => {
      const { data } = await api.patch('/auth/preferences', preferences);
      return data.user;
    },
    onSuccess: (user) => {
      useAuthStore.getState().setAuth(user, useAuthStore.getState().accessToken);
    },
  });
}

export function useLogout() {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onError: () => {
      showToast("Logout didn't reach the server, but you're signed out here", 'error');
    },
    onSettled: () => {
      // Clear local state regardless — getting stuck "logged in" because of a
      // network blip, when the person clearly wants to leave, is worse than
      // a refresh token that doesn't get explicitly revoked server-side.
      useAuthStore.getState().logout();
    },
  });
}
