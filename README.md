# Office Power Monitor — Lights, Fans, Discord

A real-time system for monitoring an office's lights and fans through a **live web dashboard** and a **Discord bot**, built for the **Techathon Nationals & Rover Summit** hackathon (IUT Robotics Society).

> "What if I could see every light and fan in the office on a live dashboard? And check how much power we're burning? And ask a bot about it right from Discord?" — the boss

This project answers exactly that. It simulates 18 devices (2 fans + 3 lights across 3 rooms), streams their state live to a React dashboard, and lets anyone query the same data conversationally through a Discord bot — all backed by a single shared backend.

---

## Architecture

```
┌────────────────────┐
│  Device Simulator   │  generates + toggles simulated device state
│  (backend/simulator)│  (adjustable speed, or fully manual)
└─────────┬───────────┘
          │
          ▼
┌────────────────────┐        REST API (/api/*)
│   Backend API       │◄──────────────────────────┐
│  (Express + Socket.io)│                         │
│  single source of   │                           │
│  truth for state    │                           │
└─────────┬───────────┘                           │
          │ WebSocket (live push)                 │
          ▼                                       │
┌────────────────────┐                  ┌──────────────────┐
│   Web Dashboard    │                  │   Discord Bot    │
│   (React + Vite)   │                  │  (discord.js +   │
│   live updates,    │                  │   Groq LLM for   │
│   manual controls  │                  │   friendly replies)│
└────────────────────┘                  └──────────────────┘
```

Both the dashboard and the Discord bot read from — and the dashboard also writes to — the same backend, so they always reflect the same reality. See `/office-monitor/docs` (or the diagrams submitted alongside this repo) for the full system diagram and circuit schematic.

---

## Project Structure

```
office-monitor/
├── backend/           # Express + Socket.io API — the single source of truth
│   └── src/
│       ├── devices/       # device data model + in-memory store
│       ├── simulator/      # random state generator + control (speed/on-off)
│       ├── alerts/         # after-hours & continuous-on anomaly detection
│       ├── api/             # REST routes used by both dashboard & bot
│       └── socket/          # live broadcast to connected dashboards
├── dashboard/         # React (Vite) live web dashboard
│   └── src/
│       ├── components/     # DevicePanel, PowerMeter, AlertsPanel, FloorPlan, ControlPanel
│       └── hooks/           # useOfficeData — socket + REST data layer
└── discord-bot/       # discord.js bot, reads from the same backend API
    └── src/
        ├── commands/        # !status, !room, !usage
        ├── alerts/           # proactive alert watcher → posts to a channel
        └── llm/               # Groq-powered humanized responses (with template fallback)
```

---

## Features

### Web Dashboard
- **Live device status panel** — all 18 devices, grouped by room, updates instantly over WebSocket (no page refresh)
- **Live power meter** — total wattage + per-room breakdown
- **Active alerts panel** — flags devices left on after office hours (9 AM–5 PM, Asia/Dhaka) and rooms with all devices on for 2+ hours continuously
- **Animated floor plan** — top-view office layout where lights glow and fans visually spin when ON
- **Manual control panel** — click any device to toggle it directly, pause/resume auto-simulation, and adjust simulation speed (1s–60s) live

### Discord Bot
| Command | What it does |
|---|---|
| `!status` | Full office status, room by room |
| `!room <name>` | Status of a specific room (e.g. `!room work1`) |
| `!usage` | Current total wattage + estimated usage |

Responses are generated from the real simulated data (never hardcoded or random) and phrased naturally using the Groq LLM API, with a safe template fallback if no API key is configured. The bot also proactively posts to a designated channel when an alert condition triggers.

### Backend
- Single in-memory store shared by both the dashboard and the bot
- REST endpoints for reads (`/api/devices`, `/api/rooms/:room`, `/api/usage`, `/api/alerts`) and writes (`PATCH /api/devices/:id`, `PATCH /api/simulator`)
- WebSocket broadcast on every state change
- Configurable simulator: auto-run on/off, and toggle interval

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free tier) — optional, only needed for humanized bot replies
- A Discord bot token — see [Discord Developer Portal](https://discord.com/developers/applications)

### 1. Backend
```bash
cd office-monitor/backend
npm install
npm start          # runs on http://localhost:4000
```

### 2. Dashboard
```bash
cd office-monitor/dashboard
npm install
npm run dev         # runs on http://localhost:5173
```
The dashboard connects to the backend at `http://localhost:4000` by default (see `src/hooks/useOfficeData.js`).

### 3. Discord Bot
```bash
cd office-monitor/discord-bot
npm install
cp .env.example .env   # then fill in the values below
node src/bot.js
```

**`discord-bot/.env`**
```env
DISCORD_TOKEN=your_discord_bot_token
BACKEND_URL=http://localhost:4000
ALERT_CHANNEL_ID=channel_id_for_proactive_alerts
GROQ_API_KEY=your_groq_key        # optional — leave blank for template fallback
GROQ_MODEL=llama-3.1-8b-instant
```

Run backend → dashboard → bot in that order (in separate terminals). All three must be running for the full demo.

---

## Data Model

Each simulated device:
```json
{
  "id": "work1-fan-1",
  "type": "fan",
  "room": "work1",
  "status": "on",
  "wattage": 60,
  "lastChanged": "2026-07-04T10:15:00Z"
}
```
- Fans: 60W when on · Lights: 15W when on
- 3 rooms × (2 fans + 3 lights) = 18 devices total

---

## Tech Stack

- **Backend:** Node.js, Express, Socket.io
- **Dashboard:** React, Vite, Socket.io-client
- **Bot:** discord.js, Groq API (LLM), node-fetch
- **No database** — in-memory store by design, swappable later without touching API/bot/dashboard code (see `deviceStore.js`)

---

## Diagrams

- System diagram (device → backend → dashboard/bot flow)
- Circuit schematic (Wokwi/Tinkercad concept — ESP32 reading device state for one representative room)

_Add links/screenshots to these here once exported from Wokwi/Tinkercad and your diagramming tool._

---

## Notes on Design Decisions

- **In-memory state instead of a database** — sufficient for hackathon scope; `deviceStore.js` isolates all state access behind functions so a real DB could be swapped in without touching the API, socket layer, or bot.
- **Simulator is fully controllable** — auto-simulation can be paused and every device driven manually from the dashboard, so the demo isn't at the mercy of random timing.
- **LLM responses never invent data** — the bot always passes the actual simulated snapshot to Groq and asks it to phrase it, with a deterministic fallback if the API is unavailable.

---

## License


