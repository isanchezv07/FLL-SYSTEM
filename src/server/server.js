import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import ip from 'ip';
import jwt from 'jsonwebtoken';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const mic = require('node-mic');

// Import database modules
import { getUsers, createUser, deleteUser, authenticateUser } from './databases/users.js';
import { initMatchesDB, getMatches, createMatch, updateMatch, getMatchById  } from './databases/matches.js';
import { initBracketsDB, getBrackets, createBracket } from './databases/brackets.js';
import { initTimerDB, getTimer, updateTimer } from './databases/timer.js';
import { getTeams } from './databases/teams.js'; 

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const JWT_SECRET = 'FLL2026';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true },
  pingTimeout: 30000, // 30 segundos antes de considerar a un cliente "muerto"
  pingInterval: 10000, // Mandar ping cada 10 segundos
  transports: ['websocket', 'polling']
});

function calculateFLLScore(m) {
  let score = 0;
  if (!m) return 0;
  const isYes = (v) => v === 'yes' || v === true;
  if (isYes(m.inspection)) score += 20;
  const m01_soil = Math.min(parseInt(m.m01_soil) || 0, 5);
  score += m01_soil * 10;
  if (isYes(m.m01_brush)) score += 10;
  const m02_sections = Math.min(parseInt(m.m02_sections) || 0, 3);
  score += m02_sections * 10;
  if (isYes(m.m03_minecart)) score += 30;
  if (isYes(m.m03_bonus)) score += 10;
  if (isYes(m.m04_artifact)) score += 30;
  if (isYes(m.m04_support)) score += 10;
  if (isYes(m.m05_floor)) score += 30;
  if (isYes(m.m07_millstone)) score += 30;
  if (isYes(m.m13_statue)) score += 30;
  const m06_ore = Math.min(parseInt(m.m06_ore) || 0, 2);
  score += m06_ore * 10;
  const m08_preserved = Math.min(parseInt(m.m08_preserved) || 0, 4);
  score += m08_preserved * 10;
  if (isYes(m.m09_roof)) score += 20;
  if (isYes(m.m09_wares)) score += 10;
  if (isYes(m.m10_tipped)) score += 20;
  if (isYes(m.m10_pan)) score += 10;
  if (isYes(m.m11_raised)) score += 20;
  if (isYes(m.m11_flag)) score += 10;
  if (isYes(m.m12_sand)) score += 20;
  if (isYes(m.m12_ship)) score += 10;
  const m14_artifacts = Math.min(parseInt(m.m14_artifacts) || 0, 8);
  score += m14_artifacts * 5;
  const tokens = Math.max(0, Math.min(parseInt(m.precision_tokens) || 0, 6));
  const precisionTable = { 6: 50, 5: 50, 4: 35, 3: 25, 2: 15, 1: 10, 0: 0 };
  score += precisionTable[tokens] || 0;
  return score;
}

// FUNCIÓN MAESTRA DE FINALIZACIÓN Y AVANCE
async function finalizeAndAdvanceMatch(matchId) {
  const match = await getMatchById(matchId);
  if (!match || match.status === 'finished') return match;

  let w1 = "", w2 = "";
  let winnerAlliance = null;
  
  if (match.scoreA > match.scoreB) {
    w1 = match.teamA1; w2 = match.teamA2;
    winnerAlliance = 'A';
  } else if (match.scoreB > match.scoreA) {
    w1 = match.teamB1; w2 = match.teamB2;
    winnerAlliance = 'B';
  }

  // 1. Emitir evento de ganador para animación
  if (winnerAlliance) {
    io.emit('matchWinnerDeclared', {
      alliance: winnerAlliance,
      team1: w1,
      team2: w2,
      score: winnerAlliance === 'A' ? match.scoreA : match.scoreB
    });
  }

  // 2. Avanzar al siguiente match si existe
  if ((w1 || w2) && match.nextMatchId) {
    const isTeamAForNext = match.position % 2 !== 0;
    const nextMatchUpdate = isTeamAForNext 
      ? { teamA1: w1, teamA2: w2, missionsA1: {}, missionsA2: {}, scoreA: 0 } 
      : { teamB1: w1, teamB2: w2, missionsB1: {}, missionsB2: {}, scoreB: 0 };

    await updateMatch(match.nextMatchId, nextMatchUpdate);
  }

  // 3. Marcar como finalizado
  const updated = await updateMatch(matchId, { status: 'finished' });
  io.emit('matchesUpdate');
  io.emit('bracketsUpdate');
  return updated;
}

app.use(express.json());

// API Endpoints
app.post('/api/brackets/generate', async (req, res) => {
  try {
    const { size, mode = '2vs2' } = req.body;
    const teams = shuffle(getTeams()).slice(0, size);
    const matchesPath = join(__dirname, 'data', 'matches.json');
    writeFileSync(matchesPath, JSON.stringify({ matches: [] }));

    const bracket = await createBracket({ name: `Tournament ${mode}`, size, mode, status: "active", date: new Date().toISOString() });
    const rounds = mode === '1vs1' ? Math.log2(size) : Math.log2(size) - 1;

    for (let round = 1; round <= rounds; round++) {
      const matchesInRound = mode === '1vs1' ? size / Math.pow(2, round) : (size / 4) / Math.pow(2, round - 1);
      for (let position = 1; position <= matchesInRound; position++) {
        let teamA1 = "", teamA2 = "", teamB1 = "", teamB2 = "";
        if (round === 1) {
          teamA1 = teams.shift()?.number || "";
          if (mode === '2vs2') teamA2 = teams.shift()?.number || "";
          teamB1 = teams.shift()?.number || "";
          if (mode === '2vs2') teamB2 = teams.shift()?.number || "";
        }
        const nextMatchPos = Math.ceil(position / 2);
        const nextId = round === rounds ? null : `match-${round + 1}-${nextMatchPos}`;
        await createMatch({
          id: `match-${round}-${position}`, bracketId: bracket.id, round, position, nextMatchId: nextId,
          teamA1, teamA2, teamB1, teamB2, scoreA: 0, scoreB: 0, status: "pending",
          missionsA1: {}, missionsA2: {}, missionsB1: {}, missionsB2: {}
        });
      }
    }
    io.emit('bracketsUpdate'); io.emit('matchesUpdate');
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/matches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const matchData = req.body;
    const existing = await getMatchById(id);

    // 1. Fusionar misiones y calcular scores actuales
    const mA1 = matchData.missionsA1 ? { ...existing.missionsA1, ...matchData.missionsA1 } : (existing.missionsA1 || {});
    const mA2 = matchData.missionsA2 ? { ...existing.missionsA2, ...matchData.missionsA2 } : (existing.missionsA2 || {});
    const mB1 = matchData.missionsB1 ? { ...existing.missionsB1, ...matchData.missionsB1 } : (existing.missionsB1 || {});
    const mB2 = matchData.missionsB2 ? { ...existing.missionsB2, ...matchData.missionsB2 } : (existing.missionsB2 || {});

    const sA = calculateFLLScore(mA1) + calculateFLLScore(mA2);
    const sB = calculateFLLScore(mB1) + calculateFLLScore(mB2);

    // 2. Guardar el estado actualizado PRIMERO (incluyendo el nuevo score y status)
    const updated = await updateMatch(id, { 
      ...matchData, 
      missionsA1: mA1, missionsA2: mA2, missionsB1: mB1, missionsB2: mB2, 
      scoreA: sA, scoreB: sB 
    });

    // 3. Si se acaba de marcar como finalizado, ejecutar la lógica de avance
    if (updated.status === 'finished' && existing.status !== 'finished') {
      await finalizeAndAdvanceMatch(id);
    }

    io.emit('matchesUpdate');
    res.json(updated);
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: error.message }); 
  }
});

app.get('/api/matches', async (req, res) => res.json(await getMatches()));
app.get('/api/matches/:id', async (req, res) => res.json(await getMatchById(req.params.id)));
app.get('/api/brackets', async (req, res) => res.json(await getBrackets()));

// SOCKET LOGIC
let timerInterval = null;
const startServerTimer = () => {
  if (timerInterval) return;
  timerInterval = setInterval(async () => {
    const timer = await getTimer();
    if (timer.isRunning && timer.timeRemaining > 0) {
      const updated = await updateTimer({ timeRemaining: timer.timeRemaining - 1 });
      io.emit('timerUpdate', updated);
    } else if (timer.isRunning && timer.timeRemaining <= 0) {
      await updateTimer({ isRunning: false });
      io.emit('timerUpdate', { timeRemaining: 0, isRunning: false });
    }
  }, 1000);
};

// Estado de volumen global
let globalVolume = 0;
let isCaptureActive = false;

io.on('connection', (socket) => {
  console.log(`[SOCKET] Nueva conexión: ${socket.id}`);
  
  startServerTimer();

  // Enviar estado inicial al cliente que se acaba de conectar
  socket.emit('volume_update', globalVolume);
  socket.emit('display_status_update', isCaptureActive ? 'LIVE' : 'READY');
  
  // ... resto de manejadores
  socket.on('getTimer', async () => socket.emit('timerUpdate', await getTimer()));
  socket.on('updateTimer', async (d) => io.emit('timerUpdate', await updateTimer(d)));
  socket.on('startTimer', async () => io.emit('timerUpdate', await updateTimer({ isRunning: true })));
  socket.on('pauseTimer', async () => io.emit('timerUpdate', await updateTimer({ isRunning: false })));
  socket.on('resetTimer', async () => io.emit('timerUpdate', await updateTimer({ timeRemaining: 150, isRunning: false })));

  socket.on('nextMatch', async () => {
    const matches = await getMatches();
    const current = matches.find(m => m.status === 'in_progress');
    if (current) {
      await finalizeAndAdvanceMatch(current.id);
      const sorted = matches.sort((a,b) => a.round - b.round || a.position - b.position);
      const idx = sorted.findIndex(m => m.id === current.id);
      if (idx < sorted.length - 1) await updateMatch(sorted[idx+1].id, { status: 'in_progress' });
    } else {
      const pending = matches.filter(m => m.status === 'pending').sort((a,b) => a.round - b.round || a.position - b.position);
      if (pending.length > 0) await updateMatch(pending[0].id, { status: 'in_progress' });
    }
    io.emit('matchesUpdate');
    io.emit('timerUpdate', await updateTimer({ timeRemaining: 150, isRunning: false }));
  });

  socket.on('prevMatch', async () => {
    const matches = await getMatches();
    const current = matches.find(m => m.status === 'in_progress');
    if (current) {
      const sorted = matches.sort((a,b) => a.round - b.round || a.position - b.position);
      const idx = sorted.findIndex(m => m.id === current.id);
      if (idx > 0) {
        await updateMatch(current.id, { status: 'pending' });
        await updateMatch(sorted[idx-1].id, { status: 'in_progress' });
      }
    }
    io.emit('matchesUpdate');
    io.emit('timerUpdate', await updateTimer({ timeRemaining: 150, isRunning: false }));
  });

  // Recibir volumen desde un cliente (SoundSource) y retransmitirlo a todos
  socket.on('sound_volume', (volume) => {
    globalVolume = volume;
    io.emit('volume_update', globalVolume);
  });

  // Notificar a todos cuando alguien empieza o detiene la captura
  socket.on('capture_state', (isActive) => {
    isCaptureActive = isActive;
    io.emit('display_status_update', isActive ? 'LIVE' : 'READY');
  });
});

// Desactivamos el micrófono local por hardware para evitar conflictos y priorizar alianzas
const startServer = async () => {
  await initMatchesDB(); await initBracketsDB(); await initTimerDB();
  httpServer.listen(3000, '0.0.0.0', () => console.log(`LEGO Engine Online on port 3000`));
};

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

startServer();