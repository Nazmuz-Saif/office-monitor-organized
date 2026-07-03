# Office Power Monitor

Hackathon project that simulates 18 devices (fans + lights) across 3 rooms, streams live state to a web dashboard over Socket.io, detects usage anomalies, and lets people check status through a Discord bot.

## Project structure

```
office-monitor/
├── backend/        Express + Socket.io — single source of truth (device state, alerts, simulator)
├── dashboard/       React + Vite — live web UI
└── discord-bot/     Discord bot — reads the same backend via REST API
```

`backend` must always be running first — both `dashboard` and `discord-bot` only read data through it, neither one talks to the other directly.

## Prerequisites

- [Node.js](https://nodejs.org) v18 or newer (check with `node -v`)
- npm (comes with Node)
- A Discord bot application + token, only if you want to test the Discord bot part (see step 4)

---

## Step-by-step: install

Open a terminal in the `office-monitor` folder and install each piece separately (they have separate `package.json` files):

```bash
cd backend
npm install

cd ../dashboard
npm install

cd ../discord-bot
npm install
```

---

## Step-by-step: run

You'll need **3 separate terminal tabs/windows** — one per service. Start them in this order.

### 1. Start the backend (required first)

```bash
cd backend
npm start
```

You should see:
```
Backend running on http://localhost:4000
```

Leave this running. It creates the 18 devices in memory and starts toggling random devices every 7 seconds to simulate real activity.

### 2. Start the dashboard

In a **new terminal**:

```bash
cd dashboard
npm run dev
```

Vite will print a local URL, usually:
```
Local: http://localhost:5173/
```

Open that link in your browser.

### 3. Start the Discord bot (optional)

Only needed if you want to test Discord commands.

In a **new terminal**:

```bash
cd discord-bot
npm start
```

You should see:
```
[bot] Logged in as YourBotName#1234
```

If the token in `discord-bot/.env` is invalid or missing, this will fail — see Troubleshooting below.

---

## Step-by-step: how to test it

### A. Test the backend alone (before touching the dashboard)

With the backend running, open a **4th terminal** and hit the API directly:

```bash
curl http://localhost:4000/api/devices
curl http://localhost:4000/api/usage
curl http://localhost:4000/api/alerts
curl http://localhost:4000/api/rooms/work1
```

Each should return JSON. If `curl` isn't available, just paste the URLs into your browser.

### B. Test the dashboard (live updates)

1. With backend + dashboard both running, open `http://localhost:5173` in your browser.
2. You should see:
   - A **"LIVE"** badge (green/amber) in the top right — confirms the Socket.io connection worked.
   - The floor plan, device list, and power meter showing data.
3. **Watch it update on its own** — every ~7 seconds a random device flips on/off in the backend terminal logs, and the dashboard UI should change *without you refreshing the page*. This is the core "no manual refresh" feature — if it never changes, something's wrong (see Troubleshooting).
4. Stop the backend (Ctrl+C in its terminal) and check the dashboard badge flips to **"DISCONNECTED"** — then restart the backend and confirm it reconnects on its own.

### C. Test alerts

Alerts only fire under two conditions, so to test them quickly you can temporarily lower the thresholds in `backend/src/alerts/alertEngine.js`:

- `CONTINUOUS_ON_THRESHOLD_MS` (default 2 hours) — lower it to e.g. `10 * 1000` (10 seconds) to see a "continuous-on" alert appear in the dashboard's Alerts panel and in Discord within ~15 seconds.
- The "after-hours" alert only fires outside 9 AM–5 PM Asia/Dhaka time — either test it at night, or temporarily change `OFFICE_HOURS` in the same file.

Remember to change the thresholds back afterward.

### D. Test the Discord bot commands

In any channel your bot has access to, type:

```
!help
!status
!room work1
!usage
```

- `!status` — summary of all 3 rooms
- `!room drawing` (or `work1` / `work2`) — one room's detail
- `!usage` — current watts + estimated kWh for today
- If `GROQ_API_KEY` is empty in `discord-bot/.env`, replies will use the plain-template fallback text instead of LLM-phrased sentences — that's expected, not a bug.

### E. Test proactive alerts in Discord

Set `ALERT_CHANNEL_ID` in `discord-bot/.env` to a real channel ID the bot can post in, restart the bot, then trigger an alert (see step C). Within 15 seconds the bot should post a message like:
```
⚠️ Hey! work1 has had all devices ON for over 2 hours. Did someone forget to turn it off?
```

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Dashboard stuck on "DISCONNECTED" | Backend isn't running, or isn't on port 4000. Start/restart `backend` first. |
| `npm start` in `backend` fails with "Cannot find module" | Run `npm install` inside `backend/` — its dependencies are separate from `dashboard`/`discord-bot`. |
| Discord bot exits immediately / login error | `DISCORD_TOKEN` in `discord-bot/.env` is missing or invalid. **Regenerate the token in the Discord Developer Portal before reusing this project** — see note below. |
| Bot logs in but commands don't reply | Backend isn't running, or `BACKEND_URL` in `discord-bot/.env` doesn't match where the backend is actually running. |
| Dashboard never changes automatically | Confirm you can see backend terminal logging device toggles every 7s; if not, backend simulator may have crashed — check its terminal for errors. |

## Security note

`discord-bot/.env` contains a real-looking bot token. It's already excluded from git via `.gitignore`, but if you plan to publish this repo or share the zip publicly, regenerate the token in the Discord Developer Portal first and drop the new one into `.env` — don't reuse the one shipped in this project.
