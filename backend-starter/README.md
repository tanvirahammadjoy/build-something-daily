# Modern Backend Starter (Controller–Service–Repository)

A production-style Node.js + TypeScript + Express backend, structured the way most
real-world teams build it today: feature-based modules, each split into clear layers
so business logic, database access, and HTTP handling never get tangled together.

## Architecture

```
src/
├── config/              # env validation (Zod) + MongoDB connection
├── modules/              # one folder per feature ("vertical slice")
│   ├── auth/
│   │   ├── auth.model.ts        # Mongoose schema
│   │   ├── auth.schema.ts       # Zod request validation + inferred types
│   │   ├── auth.repository.ts   # ONLY place that talks to the DB
│   │   ├── auth.service.ts      # business logic, calls repository
│   │   ├── auth.controller.ts   # parses req, calls service, sends res
│   │   └── auth.routes.ts       # wires routes -> middleware -> controller
│   └── tasks/                   # same pattern, second feature module
├── middlewares/          # auth guard, Zod validator, rate limiter, error handler
├── lib/                  # small reusable helpers (JWT signing, etc.)
├── utils/                # AppError, asyncHandler, logger
├── routes/index.ts        # combines all module routers under /api
├── app.ts                  # express app: security middleware + routes
└── server.ts                # entry point: connects DB, starts the server
```

### Why this shape

- **Feature folders over type folders.** Everything about "auth" lives in one place.
  Deleting or refactoring a feature never means hunting across five top-level folders.
- **Repository layer isolates the database.** Services never import Mongoose directly —
  only repositories do. Swapping MongoDB for Postgres later only touches this one layer.
- **Services hold business logic.** Controllers stay dumb on purpose: parse → call → respond.
- **Validation at the edge.** Zod schemas validate `req.body` *and* give you the TypeScript
  type for free via `z.infer<>` — no duplicate `interface` + schema maintenance.
- **One error path.** Throw `AppError('message', statusCode)` anywhere in a service;
  `asyncHandler` catches it and the central `errorHandler` middleware formats the response.

## Getting started

```bash
npm install
cp .env.example .env     # then fill in MONGO_URI and a real JWT_SECRET
npm run dev               # starts on http://localhost:5000 with hot reload
```

Build & run for production:

```bash
npm run build
npm start
```

## API reference (example modules included)

**Auth** — `/api/auth`
| Method | Route       | Auth required | Body |
|--------|-------------|----------------|------|
| POST   | `/register` | No  | `{ name, email, password }` |
| POST   | `/login`    | No  | `{ email, password }` |
| GET    | `/me`       | Yes (Bearer token) | — |

**Tasks** — `/api/tasks` (all routes require `Authorization: Bearer <token>`)
| Method | Route   | Body |
|--------|---------|------|
| GET    | `/`     | — |
| POST   | `/`     | `{ title, description?, priority?, dueDate? }` |
| PATCH  | `/:id`  | any subset of the above + `completed?` |
| DELETE | `/:id`  | — |

`GET /api/health` is open and unauthenticated — useful for uptime checks / load balancers.

## Adding a new feature module

Copy the `tasks/` folder, rename the files, and follow the same five-file pattern:
`model → schema → repository → service → controller → routes`, then register the
new router in `src/routes/index.ts`. That's the entire mental model — every feature
you add looks exactly like this.

## Notes

- Passwords are hashed with bcrypt (12 rounds) in a Mongoose `pre('save')` hook.
- JWTs are signed with `JWT_SECRET` from `.env` — use a long random string in production.
- `helmet`, `cors`, and `express-rate-limit` are wired in `app.ts` as sane security defaults.
- This starter has no test runner installed by design — drop in Jest/Vitest + Supertest
  whenever you're ready; `tests/README.txt` shows the expected shape.
