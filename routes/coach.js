// ═══════════════════════════════════════════════════════════════
// BOS COACH ROUTE — Agent endpoint with Claude tool use loop
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { BOS_COACH_SYSTEM_PROMPT, BOS_COACH_TOOLS } = require('../skills/bos-coach');
const { executeTool } = require('../tools/handlers');

const router = express.Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Agent Chat Endpoint ───
router.post('/chat', async (req, res) => {
  try {
    const { message, history, userId, sessionCookie } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation messages
    const messages = [];

    // Include conversation history (last 20 messages max)
    if (history && Array.isArray(history)) {
      const trimmed = history.slice(-20);
      trimmed.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current user message with player context
    let userContent = message;
    if (userId) {
      userContent = `[Player ID: ${userId}]\n\n${message}`;
    }
    messages.push({ role: 'user', content: userContent });

    // ─── Agent Loop: Claude reasons → calls tools → responds ───
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: BOS_COACH_SYSTEM_PROMPT,
      tools: BOS_COACH_TOOLS,
      messages: messages,
    });

    // Tool use loop — keep going until Claude gives a final text response
    const MAX_TOOL_ROUNDS = 5;
    let toolRound = 0;

    while (response.stop_reason === 'tool_use' && toolRound < MAX_TOOL_ROUNDS) {
      toolRound++;

      // Extract all tool use blocks from response
      const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');

      // Execute each tool call
      const toolResults = [];
      for (const toolUse of toolUseBlocks) {
        console.log(`🔧 Tool call [${toolRound}]: ${toolUse.name}`, JSON.stringify(toolUse.input));

        const result = await executeTool(toolUse.name, toolUse.input, sessionCookie);

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }

      // Send tool results back to Claude for next round
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        system: BOS_COACH_SYSTEM_PROMPT,
        tools: BOS_COACH_TOOLS,
        messages: messages,
      });
    }

    // Extract final text response
    const textBlocks = response.content.filter(block => block.type === 'text');
    const reply = textBlocks.map(block => block.text).join('\n');

    res.json({
      reply,
      toolsUsed: toolRound,
      model: 'claude-sonnet-4-5-20250929',
    });

  } catch (err) {
    console.error('❌ Coach agent error:', err.message);

    // Handle specific Anthropic API errors
    if (err.status === 401) {
      return res.status(500).json({ error: 'API key invalid. Check ANTHROPIC_API_KEY.' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limited. Try again in a moment.' });
    }

    res.status(500).json({ error: 'Coach is warming up. Try again.' });
  }
});

// ─── Health Check ───
router.get('/status', (req, res) => {
  res.json({
    agent: 'BOS Coach',
    status: 'online',
    model: 'claude-sonnet-4-5-20250929',
    tools: BOS_COACH_TOOLS.map(t => t.name),
    version: '1.0.0',
  });
});

module.exports = router;
