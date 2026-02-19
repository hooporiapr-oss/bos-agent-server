// ═══════════════════════════════════════════════════════════════
// BOS AGENT TOOLS — Execute tool calls from Claude
// These fetch real player data from the BOS main server
// ═══════════════════════════════════════════════════════════════

const BOS_API_URL = process.env.BOS_API_URL || 'https://bosesports.com';

// ─── Fetch helper for BOS main server ───
async function fetchBOS(endpoint, sessionCookie) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    const res = await fetch(`${BOS_API_URL}${endpoint}`, { headers });
    if (!res.ok) throw new Error(`BOS API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Tool fetch error [${endpoint}]:`, err.message);
    return { error: err.message };
  }
}

// ─── Tool Handlers ───

async function getPlayerStats(userId, sessionCookie) {
  const data = await fetchBOS(`/api/my-stats`, sessionCookie);
  if (data.error) return { error: data.error };
  return data.stats;
}

async function getPlayerScores(userId, game, limit = 20, sessionCookie) {
  const params = new URLSearchParams();
  if (game) params.set('game', game);
  if (limit) params.set('limit', limit.toString());
  const data = await fetchBOS(`/api/my-scores?${params}`, sessionCookie);
  if (data.error) return { error: data.error };
  return data.scores;
}

async function getLeaderboard(game = 'all', timeFilter = 'all', limit = 10, sessionCookie) {
  const params = new URLSearchParams({
    game,
    time: timeFilter,
    limit: limit.toString()
  });
  const data = await fetchBOS(`/api/leaderboard?${params}`, sessionCookie);
  if (data.error) return { error: data.error };
  return {
    leaderboard: data.leaderboard,
    yourRank: data.yourRank
  };
}

async function getPlayerRank(userId, game = 'all', timeFilter = 'all', sessionCookie) {
  const params = new URLSearchParams({
    game,
    time: timeFilter,
    limit: '1000'
  });
  const data = await fetchBOS(`/api/leaderboard?${params}`, sessionCookie);
  if (data.error) return { error: data.error };
  return {
    rank: data.yourRank,
    totalPlayers: data.leaderboard ? data.leaderboard.length : 0
  };
}

async function generateTrainingPlan(userId, goal, days = 7, sessionCookie) {
  // Fetch player stats so Claude can build a data-driven plan
  const stats = await getPlayerStats(userId, sessionCookie);
  const recentScores = await getPlayerScores(userId, null, 20, sessionCookie);
  return {
    playerStats: stats,
    recentScores: recentScores,
    requestedGoal: goal || 'general_improvement',
    requestedDays: days,
    note: "Use this data to generate a personalized training plan following the protocol in your knowledge base."
  };
}

// ─── Tool Router ───
// Maps tool names to their handler functions

async function executeTool(toolName, toolInput, sessionCookie) {
  switch (toolName) {
    case 'get_player_stats':
      return await getPlayerStats(toolInput.userId, sessionCookie);

    case 'get_player_scores':
      return await getPlayerScores(
        toolInput.userId,
        toolInput.game || null,
        toolInput.limit || 20,
        sessionCookie
      );

    case 'get_leaderboard':
      return await getLeaderboard(
        toolInput.game || 'all',
        toolInput.timeFilter || 'all',
        toolInput.limit || 10,
        sessionCookie
      );

    case 'get_player_rank':
      return await getPlayerRank(
        toolInput.userId,
        toolInput.game || 'all',
        toolInput.timeFilter || 'all',
        sessionCookie
      );

    case 'generate_training_plan':
      return await generateTrainingPlan(
        toolInput.userId,
        toolInput.goal,
        toolInput.days || 7,
        sessionCookie
      );

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

module.exports = { executeTool };
