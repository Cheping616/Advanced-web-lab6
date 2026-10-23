# SENG3080 Week 7 - Task API with Redis & Docker

## Setup & Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and configure variables:
   ```bash
   cp .env.example .env
   ```
3. Start Redis in Docker:
   ```bash
   docker run -d --name week7-redis -p 6379:6379 redis:7-alpine
   docker ps
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Package Roles in Request Lifecycle
- **Sequelize (ORM)**: Maps JavaScript `Task` and `User` models to SQLite tables using parameterized queries to prevent SQL injection.
- **Helmet**: Injects defensive HTTP response headers (e.g., `X-Content-Type-Options: nosniff`, `Content-Security-Policy`) early in the request pipeline.
- **express-validator**: Validates and sanitizes incoming `req.body` fields (`title`, `completed`, `priority`) prior to controller database calls.
- **Passport & bcrypt**: Hashes passwords with 12 salt rounds (`bcrypt`) and authenticates local credentials into serialized session cookies (`Passport`).
- **Compression**: Compresses HTTP response payloads to reduce bandwidth.
- **Redis**: Caches `GET /api/tasks` responses in memory for 60 seconds (`tasks:all`) and invalidates the cache key on mutations (`POST`, `PUT`, `DELETE`).

## Security Verification Record (Part 5)
- **Helmet Header Verified**: `GET /api/tasks/health` returned `X-Content-Type-Options: nosniff` and `Content-Security-Policy` headers.
- **npm audit**: Executed `npm audit` to inspect dependency vulnerabilities without forcing breaking updates.

## Part 8 Test Verification Record

| Test | Expected result | Observed Result |
| :--- | :--- | :--- |
| `GET /api/tasks/health` | 200 JSON status response; request logger output | `200 OK` - `{"status":"ok","service":"task-api"}` (Matched) |
| `POST` invalid task | 400 with validation errors | `400 Bad Request` - `{"errors":[{"msg":"title must be 3-120 characters",...}]}` (Matched) |
| `POST` valid task | 201 and a task with id | `201 Created` - `id: 1, title: "Finish Week 7 lab", priority: 1, completed: false` (Matched) |
| `GET` missing task | 404 Task not found | `404 Not Found` - `{"error":"Task not found"}` (Matched) |
| Security header check | At least one Helmet header is present | `X-Content-Type-Options: nosniff` & `Content-Security-Policy` present (Matched) |
| `GET /api/auth/me` before login | 401 Sign in required | `401 Unauthorized` - `{"error":"Sign in required"}` (Matched) |
| Register, login, then `GET /me` | 201, 200, then 200 with current user | `201 Created`, `200 OK`, `200 OK` - `id: 1, email: "student@example.com"` (Matched) |
| Two `GET /api/tasks` calls | `database` then `cache` source | 1st: `source: database`, 2nd: `source: cache` (Matched) |
| Create task then `GET /api/tasks` | `database` source and fresh data after invalidation | `201 Created` (id: 2), then `GET` returned `source: database` with task id: 2 (Matched) |