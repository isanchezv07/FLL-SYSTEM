import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import ip from 'ip';
import jwt from 'jsonwebtoken';
import yaml from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
import { calculateFLLScore } from './lib/scoring.js';

let currentDir;
if (typeof __dirname !== 'undefined') {
  currentDir = __dirname;
} else {
  currentDir = dirname(fileURLToPath(import.meta.url));
}

const app = express();
const JWT_SECRET = 'FLL2026';

// nodeRequire implementation
let nodeRequire;
try {
  const metaUrl = eval('import.meta.url');
  nodeRequire = createRequire(metaUrl);
} catch (e) {
  nodeRequire = (typeof require !== 'undefined') ? require : null;
}

// Import database modules
import { getUsers, createUser, deleteUser, authenticateUser } from './databases/users.js';
import { initMatchesDB, getMatches, createMatch, updateMatch, getMatchById, resetMatches  } from './databases/matches.js';
import { initBracketsDB, getBrackets, createBracket, clearBrackets } from './databases/brackets.js';
import { initTimerDB, getTimer, updateTimer, resetTimer } from './databases/timer.js';
import { getTeams, createTeam, updateTeam, deleteTeam } from './databases/teams.js';
import { getAlliances, updateAlliances, initAlliancesDB, resetAlliances } from './databases/alliances.js';
 
import { getAwards, updateAward, updateAnnouncement, resetAwards, initAwardsDB, updateCeremonyMode } from './databases/awards.js';

// Load Swagger document
if (process.env.NODE_ENV !== 'test') {
const swaggerDocument = yaml.load(join(currentDir, 'swagger.yaml'));
// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

const httpServer = createServer(app);

// Use a mock or dummy io for tests to avoid background connection attempts
let io;
if (process.env.NODE_ENV === 'test') {
  io = {
    emit: () => {},
    on: () => {},
    off: () => {}
  };
} else {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true },
    pingTimeout: 30000,
    pingInterval: 10000,
    transports: ['websocket', 'polling']
  });
}

// Helper to broadcast timer
async function broadcastTimerUpdate() {
  const timer = await getTimer();
  io.emit('timerUpdate', timer);
}

// Helper to broadcast alliances
async function broadcastAlliancesUpdate() {
  const alliances = await getAlliances();
  io.emit('alliancesUpdate', alliances);
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
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await authenticateUser(username, password);
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ ...user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/brackets/generate', async (req, res) => {
  try {
    const { size, mode = '2vs2', alliances } = req.body;
    let teams;
    
    if (alliances && alliances.length > 0) {
      teams = alliances.flat().map(t => ({ number: t }));
    } else {
      teams = shuffle(getTeams()).slice(0, size);
    }

    // Reset current state correctly via DB
    await resetMatches();
    await clearBrackets();
    
    // Clear timer fields too
    const timer = await getTimer();
    const fields = {};
    Object.keys(timer.fields || {}).forEach(f => fields[f] = null);
    await updateTimer({ fields });

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
    
    await broadcastTimerUpdate();
    io.emit('bracketsUpdate'); 
    io.emit('matchesUpdate');
    io.emit('tournamentReset');
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/brackets/reset', async (req, res) => {
  try {
    await resetMatches();
    await clearBrackets();
    const timer = await getTimer();
    const fields = {};
    Object.keys(timer.fields || {}).forEach(f => fields[f] = null);
    await updateTimer({ fields });

    await broadcastTimerUpdate();
    io.emit('bracketsUpdate');
    io.emit('matchesUpdate');
    io.emit('tournamentReset');
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

    // Enviar el match actualizado directamente a todos (esto lleva los puntos)
    io.emit('matchUpdate', updated);

    // 3. Solo emitimos matchesUpdate (refresco total de lista) si hubo cambio estructural
    const structuralChange = matchData.status || matchData.teamA1 || matchData.teamA2 || matchData.teamB1 || matchData.teamB2;
    
    if (structuralChange) {
      io.emit('matchesUpdate');
    }

    // 4. Si se acaba de marcar como finalizado, ejecutar la lógica de avance
    if (updated.status === 'finished' && existing.status !== 'finished') {
      await finalizeAndAdvanceMatch(id);
    }

    res.json(updated);
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: error.message }); 
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    res.json(await getMatches());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/matches/:id', async (req, res) => {
  try {
    res.json(await getMatchById(req.params.id));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.get('/api/brackets', async (req, res) => {
  try {
    res.json(await getBrackets());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Users Endpoints
app.get('/api/users', async (req, res) => res.json(getUsers()));
app.post('/api/users', async (req, res) => {
  try {
    const user = await createUser(req.body);
    io.emit('usersUpdate');
    res.json(user);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.delete('/api/teams/:id', async (req, res) => {
  try {
    await deleteTeam(req.params.id);
    io.emit('teamsUpdate');
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Alliances Endpoints
app.get('/api/alliances', async (req, res) => res.json(await getAlliances()));
app.post('/api/alliances', async (req, res) => {
  try {
    await updateAlliances(req.body);
    await broadcastAlliancesUpdate();
    res.json(await getAlliances());
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// Teams Endpoints
app.get('/api/teams', async (req, res) => res.json(getTeams()));
app.post('/api/teams', async (req, res) => {
  try {
    const team = await createTeam(req.body);
    res.json(team);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Awards Endpoints
app.get('/api/awards', async (req, res) => res.json(getAwards()));
app.put('/api/awards/:id', async (req, res) => {
  try {
    const updated = await updateAward(req.params.id, req.body);
    io.emit('awardsUpdate', getAwards());
    res.json(updated);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/awards/announcement', async (req, res) => {
  try {
    const updated = await updateAnnouncement(req.body);
    io.emit('awardsUpdate', getAwards());
    res.json(updated);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/awards/ceremony', async (req, res) => {
  try {
    const updated = await updateCeremonyMode(req.body.active);
    io.emit('awardsUpdate', getAwards());
    res.json({ active: updated });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/awards/reset', async (req, res) => {
  try {
    const updated = await resetAwards();
    io.emit('awardsUpdate', updated);
    res.json(updated);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// SOCKET LOGIC
let timerInterval = null;
const startServerTimer = () => {
  if (timerInterval) return;
  timerInterval = setInterval(async () => {
    const timer = await getTimer();
    if (timer.isRunning && timer.timeRemaining > 0) {
      await updateTimer({ timeRemaining: timer.timeRemaining - 1 });
      await broadcastTimerUpdate();
    } else if (timer.isRunning && timer.timeRemaining <= 0) {
      await updateTimer({ isRunning: false });
      await broadcastTimerUpdate();
    }
  }, 1000);
};

// Estado de volumen global
let globalVolume = 0;
let isCaptureActive = false;

if (process.env.NODE_ENV !== 'test') {
io.on('connection', (socket) => {
  console.log(`[SOCKET] Nueva conexión: ${socket.id}`);
  
  startServerTimer();

  // Enviar estado inicial al cliente que se acaba de conectar
  socket.emit('volume_update', globalVolume);
  socket.emit('display_status_update', isCaptureActive ? 'LIVE' : 'READY');
  
  // ... resto de manejadores
  socket.on('getTimer', async () => {
    await broadcastTimerUpdate();
  });
  socket.on('updateTimer', async (d) => {
    // Si d contiene allianceSelection por error del front, lo ignoramos para que no se meta en timer.json
    const { allianceSelection, ...timerData } = d;
    await updateTimer(timerData);
    await broadcastTimerUpdate();
  });

  socket.on('updateAlliances', async (d) => {
    await updateAlliances(d);
    await broadcastAlliancesUpdate();
  });
  
  socket.on('getAlliances', async () => {
    await broadcastTimerUpdate();
    await broadcastAlliancesUpdate();
  });
  socket.on('startTimer', async () => { await updateTimer({ isRunning: true }); await broadcastTimerUpdate(); });
  socket.on('pauseTimer', async () => { await updateTimer({ isRunning: false }); await broadcastTimerUpdate(); });
  socket.on('resetTimer', async () => { await updateTimer({ timeRemaining: 150, isRunning: false }); await broadcastTimerUpdate(); });

  socket.on('assignMatchToField', async ({ fieldId, matchId }) => {
    const timer = await getTimer();
    const fields = { ...timer.fields, [fieldId]: matchId };
    await updateTimer({ fields });
    await broadcastTimerUpdate();
  });

  socket.on('getAwards', () => socket.emit('awardsUpdate', getAwards()));

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
    await updateTimer({ timeRemaining: 150, isRunning: false });
    await broadcastTimerUpdate();
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
    await updateTimer({ timeRemaining: 150, isRunning: false });
    await broadcastTimerUpdate();
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
}

const startServer = async () => {
  await initMatchesDB(); 
  await initBracketsDB(); 
  await initTimerDB(); 
  await initAwardsDB(); 
  await initAlliancesDB();
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

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, httpServer, io };