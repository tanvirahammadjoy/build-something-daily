# ChatForge

A full-stack real-time chat application built with the MERN stack and Socket.io — direct messages, group chats, typing indicators, presence, emoji, and message history, all updating live across every connected client.

## Features

- **Auth** — register/login with JWT stored in an httpOnly cookie, session restored on page refresh
- **Direct messages & group chats** — start a 1-on-1 conversation or create a named group with multiple people
- **Real-time messaging** — messages appear instantly for everyone in the conversation via Socket.io, no polling
- **Typing indicators** — see when someone else is composing a reply
- **Online presence** — live online/offline status with "last seen" timestamps, correctly handles multiple open tabs/devices per user
- **Message history** — persisted in MongoDB, paginated, loaded incrementally as you scroll up
- **Emoji picker**
- **Date-grouped timestamps** — "Today" / "Yesterday" / full date dividers in the thread

## Tech Stack

**Backend:** Node.js, Express, Socket.io, MongoDB + Mongoose, JWT, bcrypt
**Frontend:** React 18 (Vite), Socket.io-client, Axios, emoji-picker-react

## Project Structure

```
chatforge/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, Conversation, Message schemas
│   ├── controllers/               # Request handlers (auth, conversations, messages, users)
│   ├── routes/                    # Express route definitions
│   ├── middleware/                # JWT auth (REST + Socket.io), error handling
│   ├── services/messageService.js # Shared message-creation logic (used by REST AND sockets)
│   ├── sockets/chatSocket.js      # All Socket.io event handlers
│   └── server.js                  # App entry point
└── frontend/
    └── src/
        ├── api/                   # Axios calls per resource
        ├── context/                # AuthContext, SocketContext
        ├── hooks/                  # useConversations, useMessages, useTypingIndicator
        ├── components/             # auth/, sidebar/, chat/, common/
        ├── pages/                  # AuthPage, ChatPage
        └── utils/                  # time formatting, conversation display helpers
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env      # Windows  (use `cp` instead of `copy` on macOS/Linux)
```

Open `.env` and fill in `MONGO_URI` (and change `JWT_SECRET` to your own random string), then:

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api` and `/socket.io` to the backend automatically (see `vite.config.js`) — no extra config needed for local development.

### 3. Try it out

Register two different accounts (e.g. in two browser windows, or one normal + one incognito), start a chat between them, and watch messages, typing indicators, and presence update live in both windows.

## Environment Variables (backend `.env`)

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens — change this to a long random string |
| `JWT_EXPIRE` | Token lifetime (default `7d`) |
| `CLIENT_URL` | Frontend origin, used for CORS (default `http://localhost:5173`) |

## REST API Reference

All routes are prefixed with `/api`. Routes marked 🔒 require the auth cookie.

| Method | Route | | Purpose |
|---|---|---|---|
| POST | `/auth/register` | | Create an account, auto-logs in |
| POST | `/auth/login` | | Authenticate |
| POST | `/auth/logout` | 🔒 | Sign out |
| GET | `/auth/me` | 🔒 | Restore session on page load |
| GET | `/users` | 🔒 | List everyone except yourself (for "start new chat") |
| POST | `/conversations` | 🔒 | Create a direct or group conversation |
| GET | `/conversations` | 🔒 | List your conversations, most recently active first |
| GET | `/messages/:conversationId?page=&limit=` | 🔒 | Paginated message history |
| POST | `/messages` | 🔒 | REST fallback for sending (the live app uses Socket.io instead) |

## Socket.io Events

| Client → Server | Payload | Effect |
|---|---|---|
| `join_conversation` | `conversationId` | Joins that conversation's room (after verifying membership) |
| `leave_conversation` | `conversationId` | Leaves the room |
| `send_message` | `{ conversationId, content }` | Persists the message, broadcasts it to the room |
| `typing_start` / `typing_stop` | `{ conversationId }` | Relayed to everyone else in the room |
| `mark_read` | `{ conversationId, messageIds }` | Adds to each message's `readBy[]`, broadcasts a read receipt |

| Server → Client | Fired when |
|---|---|
| `new_message` | A message lands in a room you've joined |
| `conversation_updated` | Any of your conversations gets a new message (drives sidebar reordering even when you're not viewing that chat) |
| `user_online` / `user_offline` | Presence changes for anyone you share a conversation with |
| `typing_start` / `typing_stop` | Someone else in the room is typing |
| `messages_read` | Read receipts |

## Architecture Notes

- **Shared message logic** — `services/messageService.js` is called by both the REST send endpoint and the Socket.io handler, so "create a message → update the conversation's preview" logic lives in exactly one place.
- **One auth path, two transports** — the same httpOnly JWT cookie authenticates REST requests (`middleware/authMiddleware.js`) and the Socket.io handshake (`middleware/socketAuthMiddleware.js`), which has to parse the raw `Cookie` header itself since Socket.io's handshake never passes through Express's `cookie-parser`.
- **Personal Socket.io rooms** (`user:<id>`) — every connected client joins a room keyed by their own user ID, which is what lets the server push presence and sidebar updates without tracking raw socket IDs.
- **Multi-tab presence** — a user only flips to "offline" once every one of their sockets has disconnected (tracked in an in-memory `Map` in `sockets/chatSocket.js`).

## Design System: "Signal & Frequency"

Rather than a generic dark-mode chat UI, ChatForge uses a deliberate visual identity built around the idea of messages as transmissions:

- **Color** — deep indigo-navy base (`#11141f`), amber/copper for your own messages and active states (`#e8a33d`), soft teal for received messages (`#4fb6a8`)
- **Type** — Sora (display/UI), Inter (body/messages), JetBrains Mono (timestamps, utility text)
- **Signature elements** — presence shown as three small "signal bars" instead of a plain dot; the typing indicator is an animated equalizer using the same visual language

## Known Limitations / Next Steps

- **Presence state is in-memory and per-process.** Fine for a single server; a multi-instance deployment would need the [Socket.io Redis adapter](https://socket.io/docs/v4/redis-adapter/) so presence is shared across processes.
- **Dev-only CORS setup.** The Vite proxy makes frontend and backend look same-origin in development. A production deployment should either serve both behind the same domain/reverse proxy, or configure explicit CORS + cross-site cookie settings (`SameSite=None; Secure`).
- **Read receipts are backend-only.** The `readBy[]` field and `mark_read`/`messages_read` events exist, but the frontend doesn't render checkmarks yet — a good next feature to add.
- **No message editing, deletion, or file attachments.**
- **No automated tests.**

## What This Project Demonstrates

- **Event-driven programming** — the entire real-time layer is built on Socket.io events rather than polling
- **Real-time UI updates** — React hooks (`useMessages`, `useConversations`, `useTypingIndicator`) bridge socket events into component state
- **Forms** — auth (login/register), message composition, group creation
- **Arrays** — message history rendering, pagination, and date-grouping all operate on arrays of messages held in component state
