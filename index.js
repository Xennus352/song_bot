require("dotenv").config();

const { Bot, InputFile } = require("grammy");
const { OpenAI } = require("openai");
const express = require("express");
const yts = require("yt-search");
const { spawn } = require("child_process");
const { PassThrough } = require("stream");
const fs = require("fs");

// ---------------- EXPRESS KEEP-ALIVE ----------------
const app = express();

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cecilium Music Bot</title>
      <style>
        body {
          margin: 0;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          font-family: Arial, sans-serif;
          color: white;
          text-align: center;
        }

        .card {
          padding: 30px 40px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 20px rgba(0,0,0,0.4);
          backdrop-filter: blur(10px);
        }

        h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }

        .emoji {
          font-size: 40px;
        }

        .status {
          color: #22c55e;
          font-weight: bold;
          margin-top: 10px;
        }

        .footer {
          margin-top: 15px;
          font-size: 12px;
          opacity: 0.7;
        }
      </style>
    </head>

    <body>
      <div class="card">
        <div class="emoji">🎵</div>
        <h1>Cecilium 2026 Music Bot</h1>
        <div class="status">● ONLINE & RUNNING</div>
        <div class="footer">Powered by Node.js • Telegram • Groq AI</div>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));

// ---------------- BOT INIT ----------------
const bot = new Bot(process.env.BOT_TOKEN);

const groq = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ---------------- CLEANUP ----------------
function cleanupFiles() {
  fs.readdirSync(".").forEach((file) => {
    if (
      file.endsWith(".mp3") ||
      file.endsWith(".webm") ||
      file.endsWith(".m4a") ||
      file.endsWith(".info.json")
    ) {
      try {
        fs.unlinkSync(file);
      } catch {}
    }
  });
}

// ---------------- SAFE YT-DLP ----------------
function getAudioStream(videoUrl) {
  const ytdlp = spawn("./yt-dlp", [
    "--quiet",
    "--no-warnings",

    // 🔥 FIX FOR BOT DETECTION
    "--extractor-args",
    "youtube:player_client=android,web,mweb,ios",

    "-f",
    "bestaudio",
    "-o",
    "-",
    videoUrl,
  ]);

  const stream = new PassThrough();
  let hasData = false;

  ytdlp.stdout.on("data", (chunk) => {
    hasData = true;
    stream.write(chunk);
  });

  ytdlp.stdout.on("end", () => stream.end());

  ytdlp.on("close", (code) => {
    if (!hasData) {
      console.error("❌ yt-dlp failed. Exit code:", code);
      stream.destroy();
    }
  });

  ytdlp.stderr.on("data", (d) => console.log("yt-dlp:", d.toString()));

  return stream;
}

// ---------------- PARSERS ----------------
function parseMusicCommand(text) {
  const match = text.match(/cecilium\s+(play|download|music)\s+(.+)/i);
  return match ? match[2] : null;
}

function parseSearchCommand(text) {
  const match = text.match(/cecilium\s+search\s+(.+)/i);
  return match ? match[1] : null;
}

// ---------------- MOOD ----------------
function detectMood(text) {
  const t = text.toLowerCase();
  if (t.includes("happy")) return "happy";
  if (t.includes("sad")) return "sad";
  if (t.includes("love")) return "romantic";
  if (t.includes("angry")) return "angry";
  return "neutral";
}

// ---------------- HANDLER ----------------
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;

  try {
    const musicQuery = parseMusicCommand(text);
    const searchQuery = parseSearchCommand(text);

    // ================= MUSIC =================
    if (musicQuery) {
      const status = await ctx.reply("🔎 Searching...");

      const result = await yts(musicQuery);
      const video = result.videos?.[0];

      if (!video) {
        return ctx.api.editMessageText(
          ctx.chat.id,
          status.message_id,
          "❌ Not found",
        );
      }

      await ctx.api.editMessageText(
        ctx.chat.id,
        status.message_id,
        "🎧 Downloading...",
      );

      const stream = getAudioStream(video.url);

      await ctx.replyWithChatAction("upload_audio");

      // 🔥 IMPORTANT FIX: prevent empty file send
      let timeout = setTimeout(() => {
        stream.destroy();
      }, 15000);

      stream.on("error", async () => {
        clearTimeout(timeout);
        await ctx.reply("❌ Failed to download audio.");
      });

      await ctx.replyWithAudio(new InputFile(stream), {
        title: video.title,
        performer: video.author?.name || "Cecilium",
        duration: video.seconds,
      });

      clearTimeout(timeout);
      cleanupFiles();

      await ctx.api.deleteMessage(ctx.chat.id, status.message_id);
      return;
    }

    // ================= SEARCH =================
    if (searchQuery) {
      const result = await yts(searchQuery);
      const videos = result.videos.slice(0, 3);

      if (!videos.length) return ctx.reply("❌ No results");

      return ctx.reply(
        "🔎 Results:\n\n" +
          videos.map((v, i) => `${i + 1}. ${v.title}`).join("\n"),
      );
    }

    // ================= AI CHAT =================
    const mood = detectMood(text);

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content: `You are Cecilium music bot. Mood: ${mood}`,
        },
        { role: "user", content: text },
      ],
    });

    await ctx.reply(response.choices[0].message.content);
  } catch (err) {
    console.error("BOT ERROR:", err);
    await ctx.reply("⚠️ Error occurred");
  }
});

// ---------------- FIX 409 ERROR ----------------
bot.start({
  drop_pending_updates: true,
});

console.log("🤖 Cecilium bot running...");
