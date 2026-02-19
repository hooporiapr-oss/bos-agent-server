const express = require('express');
const cors = require('cors');
const coachRoutes = require('./routes/coach');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS — Allow bosesports.com ───
app.use(cors({
  origin: [
    'https://bosesports.com',
    'https://www.bosesports.com',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// ─── Routes ───
app.use('/api/coach', coachRoutes);

// ─── Health / Status ───
app.get('/api/coach/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'BOS Coach Agent',
    version: '1.0.0',
    model: 'claude-sonnet-4-5-20250929',
    anthropic: !!process.env.ANTHROPIC_API_KEY
  });
});

app.get('/', (req, res) => {
  res.json({ service: 'BOS Agent Server', status: 'running' });
});

// ─── Start ───
app.listen(PORT, () => {
  console.log(`🎯 BOS Agent Server running on port ${PORT}`);
  console.log(`📡 CORS: bosesports.com`);
  console.log(`🤖 Model: claude-sonnet-4-5-20250929`);
  console.log(`🔑 API Key: ${process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing'}`);
});