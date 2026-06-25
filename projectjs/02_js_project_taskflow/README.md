# TaskFlow

A full-featured MERN todo app: recurring tasks, file attachments, calendar
view, real-time sync, in-app/email notifications, light/dark theming, and a
deployable production build.

## Status: Phase 7 complete — polish (all 7 phases done)

**Error handling**, audited end-to-end rather than assumed:
- `StatsOverview`, `CalendarView`, and the task list previously only checked
  `isLoading` — if the underlying query actually *failed*, they'd show a
  loading spinner forever instead of an error. This is the exact bug class
  that caused the infinite-loading issue earlier in the project; all three
  now check `isError` explicitly and offer a retry.
- A React error boundary now wraps the whole app — an unexpected render
  crash shows a friendly "something went wrong, reload" screen instead of a
  blank white page. Verified against real client-side rendering (`createRoot`
  + jsdom) — error boundaries don't work the same way under legacy
  server-rendering APIs, so I made sure to test the actual code path the app
  uses in a browser, not a misleading one.
- A toast notification system now covers every task mutation. Most of them
  previously failed completely silently on error (create/update/delete/
  toggle/subtasks/recurrence/attachments) — if a request failed, nothing
  told you. Logout now also clears your local session even if the server
  call fails, rather than trapping you in a "stuck logged in" state over a
  network blip.

**Theming:**
- A light/dark toggle, finally wiring up the `preferences.theme` field
  that's existed on the `User` model since Phase 1 but never had an
  endpoint. New `PATCH /api/auth/preferences`.
- Every light-theme color was checked against the actual text/background
  pairs used across the app with a WCAG contrast-ratio calculator (4.5:1 for
  text, 3:1 for icons-on-fills) *before* being committed — not eyeballed,
  since I can't visually preview this. I also went back and verified the
  original dark palette the same way, since it had never actually been
  checked, just designed by feel.
- Toggling instantly swaps a single `.light` class on `<html>`; every
  component keeps using the same `bg-canvas`/`text-ink`/etc. classes
  unchanged, since Tailwind v4 compiles those to CSS variable references
  under the hood.

**Deployable build:**
- `helmet`, `compression`, and rate limiting (20 req/15min) on auth endpoints
  — helmet's default Content-Security-Policy is disabled deliberately, since
  its restrictive defaults can silently break a bundled SPA or cross-origin
  API calls in ways I have no way to verify without a real browser.
- In production, the Express server can serve the built client directly
  (with SPA fallback routing) — one process to deploy instead of two.
- Root-level `package.json` with `npm run dev` (both servers via
  `concurrently`), `npm run build`, and `npm start`.
- `unhandledRejection`/`uncaughtException` handlers so a stray bug logs
  clearly and exits, instead of leaving the process silently hung or in a
  half-broken state.

## Running it locally (Windows)

From the repo root:
```
npm run install:all
npm run dev
```
This starts both the server and client together. Visit `http://localhost:5173`.

## Deploying

Set `NODE_ENV=production` and fill in real values for `MONGO_URI`,
`JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`, `CLOUDINARY_*`, and `EMAIL_*` in
`server/.env`. Two options:

**Single process** (simplest): `npm run build` then `npm start` from the
root — the server builds and serves the client itself on one port.

**Separately hosted** (e.g. client on Vercel/Netlify, server on
Render/Railway): build the client (`npm run build --prefix client`) and
deploy `client/dist` as a static site; deploy `server/` as a Node service.
Point the client's `VITE_API_URL`/`VITE_SOCKET_URL` at the deployed server,
and the server's `CLIENT_URL` at the deployed client (CORS + cookies depend
on this matching exactly).

## Project structure

```
taskflow/
├── package.json                       # root orchestration (dev/build/start)
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/                   # auth, task, notification
│   ├── jobs/notificationScheduler.js
│   ├── realtime/socket.js
│   ├── services/recurrenceService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   ├── rateLimiters.js
│   │   └── errorHandler.js
│   ├── models/                        # User, Task, Notification
│   ├── routes/                        # auth, task, notification
│   ├── utils/
│   ├── app.js                         # helmet, compression, CORS, static-serving
│   ├── server.js                      # boot sequence + process-level error handlers
│   └── .env.example
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── ui/                    # Button, Input, Checkbox, ErrorState
    │   │   ├── tasks/                 # TaskRow/List/Drawer, Recurrence,
    │   │   │                          # Attachments, Calendar, Overview
    │   │   ├── Layout/                # Sidebar, NotificationBell, ThemeToggle
    │   │   ├── ErrorBoundary.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/ToastContext.jsx
    │   ├── hooks/
    │   ├── lib/                       # api.js, socket.js
    │   ├── store/                     # authStore, themeStore
    │   ├── pages/                     # Login, Register, Dashboard
    │   ├── App.jsx
    │   └── index.css                  # Tailwind v4 @theme + .light override
    ├── vite.config.js
    └── .env.example
```

## Roadmap

| Phase | Scope |
|---|---|
| 1 ✅ | Folder structure, models, Express skeleton, env config |
| 2 ✅ | JWT auth: register/login/refresh, protected middleware |
| 3 ✅ | Task CRUD + categories/priorities/subtasks (API + React UI) |
| 4 ✅ | Recurring tasks + file attachments (Cloudinary) |
| 5 ✅ | Calendar view + dashboard stats |
| 6 ✅ | Real-time sync (Socket.io) + notifications (in-app + email) |
| 7 ✅ | Polish: theming, error handling, deployable build |
