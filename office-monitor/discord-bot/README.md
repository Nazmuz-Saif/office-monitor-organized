# Office Monitor — Discord Bot

Backend-এর REST API (`/api/devices`, `/api/rooms/:name`, `/api/usage`, `/api/alerts`) থেকে
data নেয় — dashboard-এর সাথে একই single source of truth।

## Setup

```bash
cd discord-bot
npm install
cp .env.example .env
```

`.env` fill up করো:
- `DISCORD_TOKEN` — Discord Developer Portal > Your App > Bot > Token
- `BACKEND_URL` — সাধারণত `http://localhost:4000` (backend আগে চালাতে হবে)
- `ALERT_CHANNEL_ID` — যে channel-এ proactive alert যাবে (channel-এ right-click > Copy ID, Developer Mode on রাখতে হবে)
- `GROQ_API_KEY` — optional, ফ্রি key নাও [console.groq.com](https://console.groq.com) থেকে। না দিলে bot template-based reply দেবে (এখনো কাজ করবে, শুধু কম "flowery")।

## Run

```bash
npm start
```

Bot চালু হওয়ার আগে backend (`../backend`) অবশ্যই চলতি অবস্থায় থাকতে হবে।

## Commands

| Command | কাজ |
|---|---|
| `!status` | সব রুমের সংক্ষিপ্ত অবস্থা |
| `!room <name>` | নির্দিষ্ট রুমের অবস্থা (`drawing`, `work1`, `work2`) |
| `!usage` | বর্তমান power draw + আজকের আনুমানিক kWh |
| `!help` | কমান্ড লিস্ট |

## Architecture note

Bot কখনো DB/deviceStore সরাসরি ছোঁয় না — শুধু backend-এর public REST API hit করে।
এটাই hackathon-এর "shared backend, single source of truth" রিকোয়ারমেন্ট পূরণ করে।
Alert watcher polling-based (প্রতি ১৫ সেকেন্ডে `/api/alerts` চেক করে), Socket.io-এর
উপর নির্ভর করে না — bot-কে dashboard-এর internal transport থেকে decouple রাখার জন্য।
