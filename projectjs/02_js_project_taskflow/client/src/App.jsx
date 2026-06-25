import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { applyUserTheme } from './store/themeStore';
import api from './lib/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const [isTakingAWhile, setIsTakingAWhile] = useState(false);

  // StrictMode (see main.jsx) intentionally double-invokes effects in dev to
  // surface non-idempotent side effects. /auth/refresh ROTATES the refresh
  // token — firing it twice on the same mount means the second call arrives
  // with an already-rotated-out token, which trips reuse-detection and logs
  // the user out. This ref makes sure the actual network call only ever
  // happens once per real mount, no matter how many times the effect re-runs.
  const hasAttemptedRefresh = useRef(false);

  useEffect(() => {
    if (hasAttemptedRefresh.current) return;
    hasAttemptedRefresh.current = true;

    // api.js sets a 15s timeout, so this request can never hang forever —
    // but if it's taking more than a couple seconds, the backend is almost
    // certainly unreachable (not running, wrong port, or DB not connected),
    // so say so instead of leaving a silent spinner.
    const slowTimer = setTimeout(() => setIsTakingAWhile(true), 3000);

    // No 'cancelled' flag here on purpose: hasAttemptedRefresh already
    // guarantees this only runs once for real. A cancelled flag set by a
    // cleanup function would be wrong here anyway — StrictMode runs this
    // effect's cleanup SYNCHRONOUSLY right after mounting (before the
    // network request even resolves), so it would permanently block
    // setInitializing(false) from ever firing once the response arrives,
    // leaving the loading screen stuck forever even on a successful 200.
    api
      .post('/auth/refresh')
      .then(async ({ data }) => {
        useAuthStore.getState().setAccessToken(data.accessToken);
        const me = await api.get('/auth/me');
        useAuthStore.getState().setAuth(me.data.user, data.accessToken);
        applyUserTheme(me.data.user);
      })
      .catch(() => {
        useAuthStore.getState().logout();
      })
      .finally(() => {
        clearTimeout(slowTimer);
        useAuthStore.getState().setInitializing(false);
      });

    return () => clearTimeout(slowTimer);
  }, []);

  if (isInitializing) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-canvas px-4 text-center font-mono text-sm text-ink-muted">
        <p>Loading…</p>
        {isTakingAWhile && (
          <p className="max-w-sm text-xs text-ink-muted/80">
            This is taking longer than expected — check that the backend server is running
            (and connected to MongoDB) at the URL in your client's VITE_API_URL.
          </p>
        )}
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
