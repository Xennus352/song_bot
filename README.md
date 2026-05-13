# Song Bot 🎵

A modern Discord music bot built for streaming music directly into voice channels with support for playlists, queue management, and interactive music controls.

---

## ✨ Features

- 🎶 Play music from YouTube and supported sources
- 📜 Queue management system
- ⏯️ Pause, resume, skip, and stop controls
- 🔊 Volume control
- 🔁 Loop and repeat support
- 📂 Playlist support
- ⚡ Fast and responsive commands
- 🎧 High quality audio streaming
- 🛠️ Easy setup and configuration

---

## 🧰 Tech Stack

- Node.js
- Discord.js
- FFmpeg
- YouTube / streaming integrations

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Xennus352/song_bot.git
cd song_bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
```

### 4. Run the bot

```bash
npm start
```

For development:

```bash
npm run dev
```

---

## 📋 Requirements

Make sure you have installed:

- Node.js v18+
- FFmpeg
- A Discord Bot Application

---

## 🤖 Creating a Discord Bot

1. Go to the Discord Developer Portal
2. Create a new application
3. Create a bot under the application
4. Enable:
   - Message Content Intent
   - Server Members Intent
5. Copy the bot token into your `.env`

---

## 🎼 Commands

| Command | Description |
|---|---|
| `/play` | Play a song from URL or search |
| `/skip` | Skip current song |
| `/pause` | Pause playback |
| `/resume` | Resume playback |
| `/stop` | Stop music and clear queue |
| `/queue` | Show current queue |
| `/volume` | Adjust volume |
| `/loop` | Toggle loop mode |

---

## 📁 Project Structure

```bash
song_bot/
├── commands/
├── events/
├── music/
├── utils/
├── .env
├── package.json
└── index.js
```

---

## 🚧 Future Improvements

- Spotify integration
- Web dashboard
- Lyrics support
- Audio filters
- Multi-language support
- Music recommendation system

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed by [Xennus352](https://github.com/Xennus352)

---

## 🔗 Repository

https://github.com/Xennus352/song_bot
