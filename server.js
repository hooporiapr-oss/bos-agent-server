// ═══════════════════════════════════════════════════════════════
// BOS AGENT SERVER v1.0.0
// AI Neurocognitive Performance Coach for BOS Esports
// Powered by Claude (Anthropic) — GoStar Digital LLC
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const coachRoutes = require('./routes/coach');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───
app.use(express.json());
app.use(cors({
  origin: [
    'https://bosesports.com',
    'http://localhost:3000',   // BOS main server local dev
    'http://localhost:3001',   // Agent server local dev
  ],
  credentials: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Routes ───
app.use('/api/coach', coachRoutes);

// ─── Root ───
app.get('/', (req, res) => {
  res.json({
    name: 'BOS Agent Server',
    version: '1.0.0',
    agents: ['BOS Coach'],
    status: 'online',
    company: 'GoStar Digital LLC',
    docs: '/api/coach/status',
  });
});

// ─── Start ───
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   🎮 BOS AGENT SERVER v1.0.0             ║
  ║   🧠 BOS Coach — ONLINE                  ║
  ║   ⚡ Port: ${PORT}                          ║
  ║   🏢 GoStar Digital LLC                   ║
  ╚═══════════════════════════════════════════╝
  `);
});
