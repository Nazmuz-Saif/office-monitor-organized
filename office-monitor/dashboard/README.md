# Office Monitor — Dashboard

Live web dashboard (React + Vite)। Backend-এর Socket.io থেকে data নেয়, তাই
কোনো manual refresh লাগে না — device state বদলালেই সাথে সাথে UI আপডেট হয়।

## Setup

```bash
cd dashboard
npm install
```

## Run

**⚠️ backend আগে চালু থাকতে হবে** (`http://localhost:4000`), নাহলে dashboard-এ
"DISCONNECTED" দেখাবে আর কোনো ডেটা আসবে না।

```bash
npm run dev
```

Vite সাধারণত `http://localhost:5173` এ চালু হয় — টার্মিনালে যে লিংক দেখাবে
সেটা browser-এ খোলো।

## Architecture

```
src/
  main.jsx              <- React entry point
  App.jsx                <- layout, useOfficeData hook থেকে data নিয়ে সব panel-এ পাঠায়
  App.css
  hooks/
    useOfficeData.js     <- socket.io-client connection + latest snapshot state
  components/
    DevicePanel.jsx       <- room-wise 18 device list
    PowerMeter.jsx         <- total + per-room watt bars
    AlertsPanel.jsx         <- active alerts list
    FloorPlan.jsx            <- SVG top-view office layout, lights glow + fans animate when ON
```