const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database setup
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'assessments.db');
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

let db;
let saveTimeout = null;

// Load or create database
async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      industry TEXT,
      revenue TEXT,
      employee_size TEXT,
      answers TEXT NOT NULL DEFAULT '{}',
      scores TEXT NOT NULL DEFAULT '{}',
      v_ai INTEGER DEFAULT 0,
      quadrant TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  saveDB();
  console.log('Database initialized');
}

function saveDB() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATH, buffer);
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }, 500);
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

// --- SCORING ENGINE ---

const SCORE_MAP = {
  q1:  { 'Legacy on-premise': 0, 'Cloud but fragmented': 25, 'Unified cloud with API': 60, 'Real-time data lake': 100 },
  q2:  { 'Over 90%': 0, '50-90%': 25, '20-50%': 60, 'Under 20%': 100 },
  q3:  { 'Productivity tool': 10, 'Automation layer': 40, 'Agentic system': 75, 'Core infrastructure': 100 },
  q4:  { 'No': 0, 'Collect but don\'t leverage': 20, 'Batch mode loops': 55, 'Continuous flywheel': 100 },
  q5:  { 'Static archives': 10, 'Transaction/CRM': 35, 'Real-time behavioral': 70, 'Unique continuous data': 100 },
  q6:  { 'No black box': 0, 'Basic logging': 25, 'Structured audit': 65, 'Full decision package': 100 },
  q7:  { 'Very little': 0, 'Relationships/trust': 30, 'Regulatory/assets': 70, 'Multiple moats': 100 },
  q8:  { 'Point solution': 10, 'Integrated with substitutes': 35, 'Deep integration': 70, 'Mission-critical': 100 },
  q9:  { 'Existential': 0, 'Severe pivot needed': 25, 'Manageable': 65, 'Irrelevant': 100 },
  q10: { 'Intermediary': 0, 'Parts at risk': 35, 'Physical/regulatory layer': 70, 'Own AI infrastructure': 100 },
  q11: { 'Significantly below': 0, 'At par': 30, 'Above benchmarks': 65, 'Matching AI-native': 100 },
  q12: { 'Nobody': 0, '1-2 people': 25, 'Small dedicated team': 60, 'Baseline across roles': 100 },
  q13: { 'Hasn\'t been asked': 0, 'IT answers': 30, 'Dedicated AI team': 65, 'CEO drives it': 100 },
  q14: { 'None': 0, 'Individual use': 20, 'Departmental': 50, 'Company-wide': 75, 'AI-native': 100 },
  q15: { 'Never': 0, '12+ months ago': 15, '6-12 months': 40, 'Within 90 days': 75, 'Weekly': 100 },
  q16: null,
  q17: { 'Don\'t have it': 0, 'Weeks': 25, 'Days': 55, 'Hours': 80, 'Already automated real-time': 100 }
};

function getScore(questionId, answer) {
  const map = SCORE_MAP[questionId];
  if (!map) return null;
  return map[answer] !== undefined ? map[answer] : 0;
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateScores(answers) {
  const readinessScores = ['q1', 'q2', 'q3', 'q12', 'q13']
    .map(q => getScore(q, answers[q])).filter(s => s !== null);
  const readiness = avg(readinessScores);

  const dataMoatScores = ['q4', 'q5', 'q6', 'q17']
    .map(q => getScore(q, answers[q])).filter(s => s !== null);
  const dataMoat = avg(dataMoatScores);

  const defensibilityScores = ['q7', 'q8', 'q9']
    .map(q => getScore(q, answers[q])).filter(s => s !== null);
  const defensibility = avg(defensibilityScores);

  const v_ai = Math.round(dataMoat * 0.4 + readiness * 0.3 + defensibility * 0.3);

  const displacementScores = ['q10', 'q11']
    .map(q => getScore(q, answers[q])).filter(s => s !== null);
  const displacement = avg(displacementScores);

  const executionScores = ['q14', 'q15']
    .map(q => getScore(q, answers[q])).filter(s => s !== null);
  const execution = avg(executionScores);

  let quadrant, quadrantColor;
  if (readiness >= 50 && defensibility >= 50) {
    quadrant = 'AI Vanguard'; quadrantColor = '#00E5FF';
  } else if (readiness >= 50 && defensibility < 50) {
    quadrant = 'The Experimentalist'; quadrantColor = '#A78BFA';
  } else if (readiness < 50 && defensibility >= 50) {
    quadrant = 'Untapped Fortress'; quadrantColor = '#FBBF24';
  } else {
    quadrant = 'Sitting Duck'; quadrantColor = '#FF4444';
  }

  const questionScores = {};
  for (const [qId, answer] of Object.entries(answers)) {
    const s = getScore(qId, answer);
    if (s !== null) questionScores[qId] = s;
  }

  return {
    readiness: Math.round(readiness * 10) / 10,
    dataMoat: Math.round(dataMoat * 10) / 10,
    defensibility: Math.round(defensibility * 10) / 10,
    v_ai,
    displacement: Math.round(displacement * 10) / 10,
    execution: Math.round(execution * 10) / 10,
    quadrant,
    quadrantColor,
    questionScores,
    barrier: answers.q16 || 'Not specified'
  };
}

// --- ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/assessments', async (req, res) => {
  try {
    const { name, email, company, industry, revenue, employeeSize, answers } = req.body;

    if (!name || !email || !company || !answers) {
      return res.status(400).json({ error: 'Missing required fields: name, email, company, answers' });
    }

    const token = uuidv4();
    const id = uuidv4();
    const scores = calculateScores(answers);

    run(
      `INSERT INTO assessments (id, token, name, email, company, industry, revenue, employee_size, answers, scores, v_ai, quadrant)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, token, name, email, company,
       industry || null, revenue || null, employeeSize || null,
       JSON.stringify(answers), JSON.stringify(scores), scores.v_ai, scores.quadrant]
    );

    res.status(201).json({ id, token, scores });

    // Fire-and-forget: push to Vbout CRM
    const nameParts = (name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const archetype = getArchetype(scores.quadrant, employeeSize);

    addToList(email, firstName, lastName, {
      company: company,
      industry: industry || '',
      v_ai_score: scores.v_ai,
      company_size: employeeSize || '',
      revenue: revenue || '',
      ro_score: scores.readiness,
      dp_score: scores.dataMoat,
      ms_score: scores.defensibility,
      di_score: scores.displacement,
      quadrant: scores.quadrant,
      archetype: archetype,
    }).then(result => {
      console.log('[Vbout] push result:', result ? 'success' : 'failed');
    }).catch(err => {
      console.error('[Vbout] push error:', err.message);
    });

  } catch (err) {
    console.error('Error creating assessment:', err);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

app.get('/api/assessments/:token', (req, res) => {
  try {
    const row = queryOne('SELECT * FROM assessments WHERE token = ?', [req.params.token]);

    if (!row) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({
      id: row.id,
      token: row.token,
      name: row.name,
      email: row.email,
      company: row.company,
      industry: row.industry,
      revenue: row.revenue,
      employeeSize: row.employee_size,
      answers: JSON.parse(row.answers),
      scores: JSON.parse(row.scores),
      v_ai: row.v_ai,
      quadrant: row.quadrant,
      createdAt: row.created_at
    });
  } catch (err) {
    console.error('Error fetching assessment:', err);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// --- PDF & PPTX GENERATION ---
const { generateAssessmentPDF } = require('./services/pdf');
const { generateBoardBriefPPTX } = require('./services/pptx');

// --- VBOUT CRM ---
const { addToList, getArchetype } = require('./services/vbout');

app.get('/api/assessments/:token/pdf', async (req, res) => {
  try {
    const row = queryOne('SELECT * FROM assessments WHERE token = ?', [req.params.token]);
    if (!row) return res.status(404).json({ error: 'Assessment not found' });

    const data = {
      name: row.name,
      email: row.email,
      company: row.company,
      industry: row.industry,
      revenue: row.revenue,
      employeeSize: row.employee_size,
      answers: JSON.parse(row.answers),
      scores: JSON.parse(row.scores)
    };

    const pdfBuffer = await generateAssessmentPDF(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="AI-Defense-Assessment-${(row.company || 'Report').replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

app.get('/api/assessments/:token/pptx', async (req, res) => {
  try {
    const row = queryOne('SELECT * FROM assessments WHERE token = ?', [req.params.token]);
    if (!row) return res.status(404).json({ error: 'Assessment not found' });

    const data = {
      name: row.name,
      email: row.email,
      company: row.company,
      industry: row.industry,
      revenue: row.revenue,
      employeeSize: row.employee_size,
      answers: JSON.parse(row.answers),
      scores: JSON.parse(row.scores)
    };

    const pptxBuffer = await generateBoardBriefPPTX(data);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="AI-Defense-Board-Brief-${(row.company || 'Report').replace(/[^a-zA-Z0-9]/g, '-')}.pptx"`);
    res.send(pptxBuffer);
  } catch (err) {
    console.error('Error generating PPTX:', err);
    res.status(500).json({ error: 'Failed to generate PPTX' });
  }
});

// Start
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`AI Defense API running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  // Save database before exit
  try {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (e) {}
  process.exit(0);
});
