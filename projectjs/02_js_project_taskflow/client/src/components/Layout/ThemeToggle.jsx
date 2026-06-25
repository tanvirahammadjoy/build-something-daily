import { useThemeStore } from '../../store/themeStore';
import { useUpdatePreferences } from '../../hooks/useAuthActions';
import { useAuthStore } from '../../store/authStore';

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updatePreferences = useUpdatePreferences();

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (isAuthenticated) {
      updatePreferences.mutate({ theme: next });
    }
  };

  return (
    <button
      onClick={toggle}
      className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <span className="text-base">{theme === 'dark' ? '☀️' : '🌙'}</span>
    </button>
  );
}
