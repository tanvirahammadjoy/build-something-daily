This folder is where you'd add tests (e.g. with Jest, Vitest, or Supertest for HTTP integration tests).

Example structure once you add a test runner:

tests/
├── unit/
│   └── auth.service.test.ts
└── integration/
    └── auth.routes.test.ts

A typical integration test with Supertest would spin up the app via createApp()
from src/app.ts (without calling listen()), then hit routes like:

  const res = await request(app).post('/api/auth/register').send({ ... });
  expect(res.status).toBe(201);
