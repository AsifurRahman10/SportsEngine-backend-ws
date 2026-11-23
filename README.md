# SportEngine Backend & WebSocket Service

A high-performance real-time sports engine backend built with **Node.js**, **Express 5**, **ws (WebSockets)**, and **Drizzle ORM** with **PostgreSQL**.

SportEngine powers real-time match tracking and live play-by-play commentary broadcasting. Whenever a match is created or new commentary is logged, updates are instantly broadcasted to connected clients.

**Live Demo:** [sportsengine-backend-ws.onrender.com](https://sportsengine-backend-ws.onrender.com/)

---

## Features

- **Real-Time WebSockets (`ws`)**:
  - Live broadcast for newly created matches to all connected clients.
  - Channel-based subscriptions for match-specific live commentary streams (`subscribe` / `unsubscribe`).
  - Automatic connection health checks (30-second ping/pong heartbeat and dead connection cleanup).
- **RESTful API (Express 5)**:
  - Match management: Create and retrieve matches with status determination (`scheduled`, `live`, `finished`).
  - Commentary management: Create and paginate commentary entries for specific matches.
- **Strict Data Validation (Zod)**:
  - Strong schema validation on query params, URL route params, and request payloads.
  - Logical constraint checks (e.g., match `endTime` must be after `startTime`).
- **PostgreSQL & Drizzle ORM**:
  - Type-safe schema definition with native PostgreSQL enums and JSONB metadata.
  - Fast migrations via Drizzle Kit.
- **CORS Configured**: Configurable client origin for seamless frontend integration (e.g. Next.js, React).

---

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **WebSocket**: `ws`
- **Database & ORM**: PostgreSQL (`pg`), Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Schema Validation**: Zod
- **Package Manager**: pnpm

---

## Project Structure

```text
sportEngine-backend-ws/
├── drizzle/                  # Generated Drizzle SQL migration files
├── src/
│   ├── app.js                # Express & HTTP server bootstrap, CORS, route registration
│   ├── server.js             # WebSocket server implementation & event broadcasters
│   ├── db/
│   │   ├── db.js             # PostgreSQL connection pool and Drizzle client instance
│   │   └── schema.js         # Matches and Commentary database schema definitions
│   ├── middleware/
│   │   └── validateRequest.js# Generic Zod validation middleware for HTTP requests
│   ├── modules/
│   │   ├── match/
│   │   │   └── match.js      # Match routes (GET list, POST create)
│   │   └── commentary/
│   │       └── commentary.js # Commentary routes (GET list, POST create)
│   ├── utils/
│   │   └── getMatchStatus.js # Match status calculation based on start and end timestamps
│   └── validation/
│       ├── matchValidation.js     # Zod schemas for match query and payload
│       └── commentaryValidation.js# Zod schemas for commentary query and payload
├── drizzle.config.ts         # Drizzle Kit configuration
├── package.json              # Project dependencies and npm scripts
└── pnpm-lock.yaml            # pnpm lockfile
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended, supports native `--env-file` and `--watch`)
- [pnpm](https://pnpm.io/) (v9+ or v12+)
- Running [PostgreSQL](https://www.postgresql.org/) database instance

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd sportEngine-backend-ws
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Configure your environment values:

| Variable       | Description                    | Default                                                 |
| -------------- | ------------------------------ | ------------------------------------------------------- |
| `PORT`         | HTTP & WebSocket server port   | `5000`                                                  |
| `HOST`         | Host address to bind to        | `0.0.0.0`                                               |
| `CLIENT_URL`   | Allowed client origin for CORS | `http://localhost:3000`                                 |
| `DATABASE_URL` | PostgreSQL connection string   | `postgresql://user:password@localhost:5432/sportengine` |

### 3. Database Migrations

Generate and run Drizzle migrations against your PostgreSQL database:

```bash
# Generate SQL migrations from schema
pnpm generate

# Apply migrations to database
pnpm migrate
```

---

## Deploying to Render

When deploying as a **Web Service** on Render:

1. **Build & Start Commands**:
   - **Build Command**: `pnpm install && pnpm migrate`
   - **Start Command**: `pnpm start`
2. **Environment Variables**:
   - `DATABASE_URL`: Your production PostgreSQL connection string (e.g. Neon, Supabase, or Render PostgreSQL).
   - `CLIENT_URL`: Your frontend URL (e.g. `https://your-frontend.vercel.app`).
   - `HOST`: Set to `0.0.0.0` (Render requires binding to `0.0.0.0`, **not** `localhost`).
   - `PORT`: (Optional) Render automatically injects `PORT=10000`, which the server will pick up automatically.

---

### 4. Running the Application

```bash
# Development mode (auto-reload on file changes, auto-frees port 5000)
pnpm dev

# Production mode
pnpm start
```

---

## API Reference

### Health Check

- **`GET /`**
  - **Response**: `200 OK`
  - **Body**: `"Welcome to the SportEngine WebSocket Server!"`

---

### Matches

#### 1. List Matches

- **Endpoint**: `GET /match`
- **Query Parameters**:
  - `limit` _(optional, number, max: 100, default: 50)_
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": 1,
        "sport": "Football",
        "homeTeam": "Arsenal",
        "awayTeam": "Chelsea",
        "status": "live",
        "startTime": "2026-11-23T18:00:00.000Z",
        "endTime": "2026-11-23T20:00:00.000Z",
        "homeScore": 1,
        "awayScore": 0,
        "createdAt": "2026-11-23T17:30:00.000Z"
      }
    ]
  }
  ```

#### 2. Create Match

- **Endpoint**: `POST /match`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "sport": "Football",
    "homeTeam": "Arsenal",
    "awayTeam": "Chelsea",
    "startTime": "2026-11-23T18:00:00.000Z",
    "endTime": "2026-11-23T20:00:00.000Z",
    "homeScore": 0,
    "awayScore": 0
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "match": {
      "id": 1,
      "sport": "Football",
      "homeTeam": "Arsenal",
      "awayTeam": "Chelsea",
      "status": "live",
      "startTime": "2026-11-23T18:00:00.000Z",
      "endTime": "2026-11-23T20:00:00.000Z",
      "homeScore": 0,
      "awayScore": 0,
      "createdAt": "2026-11-23T18:00:00.000Z"
    }
  }
  ```
- **Side Effect**: Emits `matchCreated` WebSocket event to all connected clients.

---

### Commentary

#### 1. List Match Commentary

- **Endpoint**: `GET /match/:id/commentary`
- **Path Parameters**:
  - `id` _(required, integer)_: Match ID
- **Query Parameters**:
  - `limit` _(optional, number, max: 100, default: 10)_
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": 1,
        "matchId": 1,
        "minute": 23,
        "sequence": 1,
        "period": "1st Half",
        "eventType": "goal",
        "actor": "Bukayo Saka",
        "team": "Arsenal",
        "message": "Goal! Arsenal takes the lead.",
        "metadata": { "assist": "Martin Ødegaard" },
        "tags": ["goal", "arsenal"],
        "createdAt": "2026-11-23T18:23:00.000Z"
      }
    ]
  }
  ```

#### 2. Add Match Commentary

- **Endpoint**: `POST /match/:id/commentary`
- **Path Parameters**:
  - `id` _(required, integer)_: Match ID
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "minute": 23,
    "sequence": 1,
    "period": "1st Half",
    "eventType": "goal",
    "actor": "Bukayo Saka",
    "team": "Arsenal",
    "message": "Goal! Arsenal takes the lead.",
    "metadata": { "assist": "Martin Ødegaard" },
    "tags": ["goal", "arsenal"]
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "data": {
      "id": 1,
      "matchId": 1,
      "minute": 23,
      "sequence": 1,
      "period": "1st Half",
      "eventType": "goal",
      "actor": "Bukayo Saka",
      "team": "Arsenal",
      "message": "Goal! Arsenal takes the lead.",
      "metadata": { "assist": "Martin Ødegaard" },
      "tags": ["goal", "arsenal"],
      "createdAt": "2026-11-23T18:23:00.000Z"
    }
  }
  ```
- **Side Effect**: Emits `commentary` WebSocket event to all subscribers of `matchId`.

---

## WebSocket Protocol

WebSocket server endpoint:

```text
ws://localhost:5000/ws
```

### Connection Lifecycle

1. **Initial Connection**:
   - Client connects to `/ws`.
   - Server returns welcome message:
     ```json
     { "type": "welcome" }
     ```

2. **Subscribe to Match Updates**:
   - Client sends:
     ```json
     {
       "type": "subscribe",
       "matchId": 1
     }
     ```
   - Server responds:
     ```json
     {
       "type": "subscribed",
       "matchId": 1
     }
     ```

3. **Unsubscribe from Match Updates**:
   - Client sends:
     ```json
     {
       "type": "unsubscribe",
       "matchId": 1
     }
     ```
   - Server responds:
     ```json
     {
       "type": "unsubscribed",
       "matchId": 1
     }
     ```

4. **Heartbeat**:
   - The server triggers a `ping` every 30 seconds.
   - Connected clients must answer with `pong` to keep the connection alive. Inactive connections are terminated automatically.

### Broadcast Events

#### `matchCreated` (Global Broadcast)

Sent to **all** connected clients when any new match is added:

```json
{
  "type": "matchCreated",
  "match": {
    "id": 1,
    "sport": "Football",
    "homeTeam": "Arsenal",
    "awayTeam": "Chelsea",
    "status": "live",
    "startTime": "2026-11-23T18:00:00.000Z",
    "endTime": "2026-11-23T20:00:00.000Z",
    "homeScore": 0,
    "awayScore": 0,
    "createdAt": "2026-11-23T18:00:00.000Z"
  }
}
```

#### `commentary` (Match Subscription Broadcast)

Sent **only** to clients subscribed to the corresponding `matchId`:

```json
{
  "type": "commentary",
  "data": {
    "id": 1,
    "matchId": 1,
    "minute": 23,
    "sequence": 1,
    "period": "1st Half",
    "eventType": "goal",
    "actor": "Bukayo Saka",
    "team": "Arsenal",
    "message": "Goal! Arsenal takes the lead.",
    "metadata": { "assist": "Martin Ødegaard" },
    "tags": ["goal", "arsenal"],
    "createdAt": "2026-11-23T18:23:00.000Z"
  }
}
```

---

## License

This project is licensed under the [ISC License](LICENSE).
