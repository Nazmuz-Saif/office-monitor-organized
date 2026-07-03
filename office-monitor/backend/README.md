# Office Monitor — Backend

Single source of truth backend। ১৮টা device-এর in-memory state রাখে, ৭ সেকেন্ড
পরপর random device toggle করে simulate করে, আর REST API + Socket.io দিয়ে
dashboard এবং Discord bot দুইজনকেই একই data দেয়।

## Setup

```bash
cd backend
npm install
```

## Run

```bash
npm start
```

চালু হলে দেখবে:
```
Backend running on http://localhost:4000
```

## Endpoints

| Route | কাজ |
|---|---|
| `GET /api/devices` | সব ১৮টা ডিভাইসের বর্তমান অবস্থা |
| `GET /api/rooms/:roomName` | নির্দিষ্ট রুমের ডিভাইস (`drawing`, `work1`, `work2`) |
| `GET /api/usage` | total watts + per-room watts |
| `GET /api/alerts` | সক্রিয় anomaly/alert-এর লিস্ট |
| Socket.io event `snapshot` | client কানেক্ট হলে current state |
| Socket.io event `deviceUpdate` | যেকোনো device change হলে broadcast |

## Architecture

```
src/
  server.js           <- entry point, wiring only
  devices/            <- single source of truth (state + initial device list)
  alerts/             <- anomaly detection logic (stateless)
  api/                <- HTTP routes (thin wrapper over devices/alerts)
  socket/              <- Socket.io broadcaster for live dashboard updates
  simulator/           <- fake device state changes (no real hardware)
```