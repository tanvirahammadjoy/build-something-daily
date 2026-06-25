import { create } from 'zustand';

const STORAGE_KEY = 'taskflow-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem(STORAGE_KEY) || 'dark';
}

function applyThemeClass(theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('light', theme === 'light');
}

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyThemeClass(theme);
    set({ theme });
  },
}));

// Theme preference is not security-sensitive (unlike the access token), so
// localStorage is the right tool here — it lets the correct theme apply
// immediately on page load, before React even renders, avoiding a flash of
// the wrong theme.
applyThemeClass(getInitialTheme());

// Called once a user's data is available (login/register/silent refresh) so
// their saved server-side preference takes over from whatever was cached
// locally — keeps the theme consistent across devices for a logged-in user.
export function applyUserTheme(user) {
  const theme = user?.preferences?.theme === 'light' ? 'light' : 'dark';
  useThemeStore.getState().setTheme(theme);
}
