// bot.js
// Entry point। শুধু wiring — command routing + client setup, কোনো business logic এখানে নেই
// (logic commands/ আর alerts/ ফোল্ডারে, ডেটা officeApi.js দিয়ে backend থেকে আসে)।

import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { handleStatus } from "./commands/status.js";
import { handleRoom } from "./commands/room.js";
import { handleUsage } from "./commands/usage.js";
import { startAlertWatcher } from "./alerts/alertWatcher.js";

const PREFIX = "!";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`[bot] Logged in as ${client.user.tag}`);
  startAlertWatcher(client, process.env.ALERT_CHANNEL_ID);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const [cmd, ...args] = message.content.slice(PREFIX.length).trim().split(/\s+/);

  try {
    if (cmd === "status") {
      await message.reply(await handleStatus());
    } else if (cmd === "room") {
      await message.reply(await handleRoom(args[0]));
    } else if (cmd === "usage") {
      await message.reply(await handleUsage());
    } else if (cmd === "help") {
      await message.reply(
        "Commands:\n`!status` — সব রুমের সংক্ষিপ্ত অবস্থা\n`!room <name>` — নির্দিষ্ট রুমের অবস্থা (drawing/work1/work2)\n`!usage` — বর্তমান + আজকের আনুমানিক power usage"
      );
    }
  } catch (err) {
    console.error(`[bot] command "${cmd}" failed:`, err.message);
    await message.reply("দুঃখিত, backend থেকে ডেটা আনতে সমস্যা হচ্ছে — backend চালু আছে কিনা চেক করো।");
  }
});

client.login(process.env.DISCORD_TOKEN);
