import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  // True until the app has attempted a silent session restore on load.
  // The access token only lives in memory, so a full page reload needs to
  // try /auth/refresh once (using the httpOnly cookie) before we know
  // whether the person is actually logged in.
  isInitializing: true,

  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
