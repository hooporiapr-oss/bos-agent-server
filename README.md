# 🎮 BOS Agent Server

**AI Neurocognitive Performance Coach for BOS Esports**  
Powered by Claude (Anthropic) — GoStar Digital LLC

## Architecture

```
bosesports.com (main server)     bos-agent-server (this repo)
┌─────────────────────┐          ┌──────────────────────────┐
│  Strobe Drill        │          │  Claude API (Sonnet)     │
│  FlickShot           │◄────────►│  BOS Coach Skill         │
│  Leaderboards        │  API     │  Tool Handlers           │
│  Player Data         │  calls   │  Agent Loop              │
│  Auth / Stripe       │          │  Chat Widget             │
└─────────────────────┘          └──────────────────────────┘
```

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR-USERNAME/bos-agent-server.git
cd bos-agent-server

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY

# Run
npm start
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/coach/chat` | POST | Send message to BOS Coach agent |
| `/api/coach/status` | GET | Agent health check |
| `/` | GET | Server info |

### POST /api/coach/chat

```json
{
  "message": "Analyze my FlickShot performance",
  "userId": "u_123456",
  "history": [],
  "sessionCookie": "optional-for-auth"
}
```

**Response:**
```json
{
  "reply": "Looking at your FlickShot data...",
  "toolsUsed": 2,
  "model": "claude-sonnet-4-5-20250929"
}
```

## Agent Tools

The BOS Coach can call these tools to access real player data:

- **get_player_stats** — Overall performance summary
- **get_player_scores** — Recent game session details
- **get_leaderboard** — Current rankings
- **get_player_rank** — Player's competitive position
- **generate_training_plan** — Personalized training recommendations

## Deploy on Render

1. Create new **Web Service** on Render
2. Connect your GitHub repo
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. Add environment variable: `ANTHROPIC_API_KEY`
6. Add environment variable: `BOS_API_URL=https://bosesports.com`

## Tech Stack

- **Brain:** Claude Sonnet 4.5 (Anthropic API)
- **Server:** Node.js + Express
- **Protocol:** Dr. Delgado's Neurocognitive Training
- **Company:** GoStar Digital LLC 🇵🇷

## License

Proprietary — GoStar Digital LLC © 2026
