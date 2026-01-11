const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'darpan-secret-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database setup
const db = new sqlite3.Database('darpan.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    grade INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Game sessions table
  db.run(`CREATE TABLE IF NOT EXISTS game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject TEXT NOT NULL,
    game_type TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Progress table
  db.run(`CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject TEXT NOT NULL,
    concept TEXT NOT NULL,
    mastery_level REAL DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Create admin user
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, email, password, role) 
          VALUES ('admin', 'admin@darpan.com', ?, 'admin')`, [adminPassword]);
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  const { username, email, password, grade } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(`INSERT INTO users (username, email, password, grade) VALUES (?, ?, ?, ?)`,
    [username, email, hashedPassword, grade], function (err) {
      if (err) return res.status(400).json({ error: 'User already exists' });
      res.json({ message: 'User created successfully', userId: this.lastID });
    });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, grade: user.grade } });
  });
});

app.post('/api/game-session', authenticateToken, (req, res) => {
  const { subject, gameType, score, timeSpent, completed } = req.body;

  db.run(`INSERT INTO game_sessions (user_id, subject, game_type, score, time_spent, completed) 
          VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, subject, gameType, score, timeSpent, completed], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to save session' });

      // Update progress
      db.run(`INSERT OR REPLACE INTO progress (user_id, subject, concept, mastery_level, attempts, best_score, updated_at)
              VALUES (?, ?, ?, 
                COALESCE((SELECT mastery_level FROM progress WHERE user_id = ? AND subject = ? AND concept = ?), 0) + 0.1,
                COALESCE((SELECT attempts FROM progress WHERE user_id = ? AND subject = ? AND concept = ?), 0) + 1,
                MAX(?, COALESCE((SELECT best_score FROM progress WHERE user_id = ? AND subject = ? AND concept = ?), 0)),
                CURRENT_TIMESTAMP)`,
        [req.user.id, subject, gameType, req.user.id, subject, gameType, req.user.id, subject, gameType, score, req.user.id, subject, gameType]);

      res.json({ message: 'Session saved', sessionId: this.lastID });
    });
});

app.get('/api/progress/:userId', authenticateToken, (req, res) => {
  const userId = req.params.userId;

  db.all(`SELECT * FROM progress WHERE user_id = ?`, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch progress' });
    res.json(rows);
  });
});

app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

  const queries = {
    users: `SELECT COUNT(*) as count FROM users WHERE role = 'student'`,
    sessions: `SELECT COUNT(*) as count FROM game_sessions`,
    avgScore: `SELECT AVG(score) as avg FROM game_sessions WHERE completed = 1`,
    subjects: `SELECT subject, COUNT(*) as sessions, AVG(score) as avg_score FROM game_sessions GROUP BY subject`
  };

  const results = {};
  let completed = 0;

  Object.keys(queries).forEach(key => {
    db.all(queries[key], (err, rows) => {
      if (!err) results[key] = rows;
      completed++;
      if (completed === Object.keys(queries).length) {
        res.json(results);
      }
    });
  });
});

app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

  db.all(`SELECT id, username, email, grade, created_at FROM users WHERE role = 'student'`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch users' });
    res.json(rows);
  });
});

app.get('/api/admin/sessions', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

  db.all(`SELECT gs.*, u.username FROM game_sessions gs 
          JOIN users u ON gs.user_id = u.id 
          ORDER BY gs.created_at DESC LIMIT 100`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch sessions' });
    res.json(rows);
  });
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'game.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log('🌌 DARPAN Server Started Successfully');
  console.log('========================================');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🎮 Games: http://localhost:${PORT}/game`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
  console.log('========================================');
  console.log('👤 Default Admin: admin / admin123');
  console.log('📊 Database: darpan.db (SQLite)');
  console.log('========================================');
});

module.exports = app;