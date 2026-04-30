const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['https://sahaay-coral.vercel.app', 'http://localhost:5173'],
  credentials: true
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use(express.json());

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseUrl.startsWith('https://')) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase Client initialized.');
} else {
  console.warn('⚠️ SUPABASE_URL is missing or invalid. Check your environment variables.');
}

// Helper for local fallback if Supabase isn't set up
const Database = require('better-sqlite3');
const db = new Database('sahaay.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    message TEXT,
    response TEXT,
    emotion TEXT,
    risk TEXT,
    suggestions TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    activity_type TEXT,
    duration INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS task_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    task_id TEXT,
    completed BOOLEAN,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Alias for /api/chat to /chat as requested
app.post('/chat', async (req, res) => {
  console.log('Incoming chat request to /chat');
  return handleChat(req, res);
});

app.post('/api/chat', async (req, res) => {
  console.log('Incoming chat request to /api/chat');
  return handleChat(req, res);
});

const handleChat = async (req, res) => {
  const { message, userId = 'guest' } = req.body;

  try {
    // 1. Call CrewAI Python Service
    console.log('Calling CrewAI service...');
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const aiResponse = await axios.post(`${aiServiceUrl}/chat`, { message });
    const { emotion, confidence, risk, reply, suggestions } = aiResponse.data;

    // 2. Store in Supabase or SQLite
    try {
      if (supabase) {
        const { error } = await supabase
          .from('chat_history')
          .insert([
            { 
              user_id: userId, 
              message, 
              response: reply, 
              emotion, 
              confidence, 
              risk, 
              suggestions: suggestions.join(',') 
            }
          ]);
        if (error) throw error;
      } else {
        throw new Error('Supabase not configured');
      }
    } catch (dbErr) {
      console.warn('Supabase store failed, falling back to local DB:', dbErr.message);
      const stmt = db.prepare('INSERT INTO chat_history (user_id, message, response, emotion, risk, suggestions) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(userId, message, reply, emotion, risk, suggestions.join(','));
    }

    res.json({ reply, emotion, risk, suggestions });

  } catch (error) {
    console.error('AI Service Error:', error.message);
    res.status(500).json({ 
      reply: "I'm having a bit of trouble connecting right now, but I'm still here for you. 💙",
      emotion: 'unknown',
      risk: 'low',
      suggestions: ['Try taking a deep breath', 'Maybe check your connection']
    });
  }
};

// Track User Activity (Calm Minutes, Hub Usage)
app.post('/api/activity', (req, res) => {
  const { userId = 'guest', type, duration = 0 } = req.body;
  const stmt = db.prepare('INSERT INTO user_activity (user_id, activity_type, duration) VALUES (?, ?, ?)');
  stmt.run(userId, type, duration);
  res.json({ success: true });
});

// Track Tasks
app.post('/api/tasks', (req, res) => {
  const { userId = 'guest', taskId, completed } = req.body;
  const stmt = db.prepare('INSERT INTO task_logs (user_id, task_id, completed) VALUES (?, ?, ?)');
  stmt.run(userId, taskId, completed ? 1 : 0);
  res.json({ success: true });
});

// Fetch Real-time Metrics
app.get('/api/metrics', (req, res) => {
  const { userId = 'guest' } = req.query;

  try {
    // 1. Emotional Stability Calculation
    // Positive emotions: joy, love, surprise, neutral (count as positive for stability)
    // Negative emotions: anger, fear, sadness
    const chatStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN emotion IN ('joy', 'love', 'surprise', 'neutral') THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN emotion IN ('anger', 'fear', 'sadness') THEN 1 ELSE 0 END) as negative
      FROM chat_history WHERE user_id = ?
    `).get(userId);

    const taskCount = db.prepare('SELECT COUNT(*) as count FROM task_logs WHERE user_id = ? AND completed = 1').get(userId);
    
    let emotionalStability = 50; // Default
    if (chatStats.total > 0) {
      emotionalStability = Math.round(((chatStats.positive - chatStats.negative) / chatStats.total) * 100);
      emotionalStability = Math.max(0, Math.min(100, emotionalStability + (taskCount.count * 2))); // Boost by tasks
    } else {
      emotionalStability = 50 + (taskCount.count * 5); // Start at 50 if no chat
    }
    emotionalStability = Math.min(100, emotionalStability);

    // 2. Resilience Score Calculation
    // Based on consistency and recovery (simplified for demo)
    const sessions = db.prepare('SELECT COUNT(DISTINCT date(timestamp)) as days FROM chat_history WHERE user_id = ?').get(userId);
    const score = (sessions.days * 10) + (taskCount.count * 5);
    
    let resilience = 'Moderate';
    if (score < 20) resilience = 'Low';
    else if (score < 50) resilience = 'Moderate';
    else if (score < 80) resilience = 'High';
    else resilience = 'Strong';

    // 3. Calm Minutes Calculation
    const calmStats = db.prepare("SELECT SUM(duration) as total FROM user_activity WHERE user_id = ? AND activity_type = 'calm'").get(userId);
    const calmMinutes = Math.round(calmStats.total || 0);

    res.json({
      emotionalStability,
      resilience,
      calmMinutes,
      stabilityTrend: emotionalStability > 60 ? '↑' : '→',
      calmTrend: calmMinutes > 10 ? '↑' : '→'
    });

  } catch (error) {
    console.error('Metrics Error:', error.message);
    res.json({ emotionalStability: 50, resilience: 'Moderate', calmMinutes: 0 });
  }
});

app.get('/api/insights', async (req, res) => {
  const { userId = 'guest' } = req.query;

  try {
    let history = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('chat_history')
        .select('emotion, risk, timestamp')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(20);
      if (error) throw error;
      history = data;
    } else {
      history = db.prepare('SELECT emotion, risk, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20').all(userId);
    }

    // Prepare data for Recharts
    const trends = history.map((h, i) => ({
      day: `S-${history.length - i}`,
      stress: h.risk === 'HIGH' ? 8 : (h.emotion === 'neutral' ? 2 : 5)
    })).reverse();

    // Call AI to summarize the trends
    const emotions = history.map(h => h.emotion);
    let summary = "You've been sharing a range of feelings lately.";
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const aiSum = await axios.post(`${aiServiceUrl}/summarize`, { emotions });
      summary = aiSum.data.summary;
    } catch (e) {
      console.warn('AI Summarization failed:', e.message);
    }

    res.json({ trends, summary });

  } catch (error) {
    console.error('Insights Error:', error.message);
    res.json({ 
      trends: [{day: 'No Data', stress: 0}], 
      summary: "Start chatting with me to see your emotional patterns here! 💙" 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
