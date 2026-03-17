import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import ip from 'ip';
import jwt from 'jsonwebtoken';

// Import database modules
import { getUsers, createUser, deleteUser, authenticateUser } from './databases/users.js';
import { initMatchesDB, getMatches, createMatch, updateMatch, getMatchById  } from './databases/matches.js';
import { initBracketsDB, getBrackets, createBracket } from './databases/brackets.js';
import { initTimerDB, getTimer, updateTimer } from './databases/timer.js';
import { getTeams } from './databases/teams.js'; 

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// JWT Secret
const JWT_SECRET = 'FLL2026';

// Express app setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

function calculateFLLScore(m) {
  let score = 0;
  if (!m) return 0;

  // --- INSPECCIÓN TÉCNICA ---
  // Límite: Sí (20 pts) o No (0 pts)
  if (m.inspection === 'yes' || m.inspection === true) {
    score += 20;
  }

  // M01: Surface Brushing
  // Límite: Máximo 5 depósitos de suelo
  const m01_soil = Math.min(parseInt(m.m01_soil) || 0, 5);
  score += m01_soil * 10;
  if (m.m01_brush === 'yes' || m.m01_brush === true) score += 10;

  // M02: Map Reveal
  // Límite: Máximo 3 secciones
  const m02_sections = Math.min(parseInt(m.m02_sections) || 0, 3);
  score += m02_sections * 10;

  // M03: Mineshaft Explorer
  if (m.m03_minecart === 'yes' || m.m03_minecart === true) score += 30;
  if (m.m03_bonus === 'yes' || m.m03_bonus === true) score += 10;

  // M04: Careful Recovery
  if (m.m04_artifact === 'yes' || m.m04_artifact === true) score += 30;
  if (m.m04_support === 'yes' || m.m04_support === true) score += 10;

  // M05, M07, M13 (Misiones de estado único)
  if (m.m05_floor === 'yes' || m.m05_floor === true) score += 30;
  if (m.m07_millstone === 'yes' || m.m07_millstone === true) score += 30;
  if (m.m13_statue === 'yes' || m.m13_statue === true) score += 30;

  // M06: Forge
  // Límite: Máximo 2 piezas de mineral
  const m06_ore = Math.min(parseInt(m.m06_ore) || 0, 2);
  score += m06_ore * 10;

  // M08: Silo
  // Límite: Máximo 4 piezas preservadas
  const m08_preserved = Math.min(parseInt(m.m08_preserved) || 0, 4);
  score += m08_preserved * 10;

  // M09: What's on Sale?
  if (m.m09_roof === 'yes' || m.m09_roof === true) score += 20;
  if (m.m09_wares === 'yes' || m.m09_wares === true) score += 10;

  // M10: Tip the Scales
  if (m.m10_tipped === 'yes' || m.m10_tipped === true) score += 20;
  if (m.m10_pan === 'yes' || m.m10_pan === true) score += 10;

  // M11: Angler Artifacts
  if (m.m11_raised === 'yes' || m.m11_raised === true) score += 20;
  if (m.m11_flag === 'yes' || m.m11_flag === true) score += 10;

  // M12: Salvage Operation
  if (m.m12_sand === 'yes' || m.m12_sand === true) score += 20;
  if (m.m12_ship === 'yes' || m.m12_ship === true) score += 10;

  // M14: Forum
  // Límite: Máximo 8 artefactos
  const m14_artifacts = Math.min(parseInt(m.m14_artifacts) || 0, 8);
  score += m14_artifacts * 5;

  // M16: Precision Tokens
  // Límite: 0 a 6 tokens
  const tokens = Math.max(0, Math.min(parseInt(m.precision_tokens) || 0, 6));
  const precisionTable = { 6: 50, 5: 50, 4: 35, 3: 25, 2: 15, 1: 10, 0: 0 };
  score += precisionTable[tokens] || 0;

  return score;
}

app.use(express.json());

// Initialize all databases
const initializeDatabases = async () => {
  try {
    await initMatchesDB();
    await initBracketsDB();
    await initTimerDB();
    console.log('All databases initialized successfully');
  } catch (error) {
    console.error('Error initializing databases:', error);
  }
};

const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Authentication endpoints
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await authenticateUser(username, password);
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ success: false, message: error.message || 'Credenciales inválidas' });
  }
});

// User management endpoints
app.get('/api/users', async (req, res) => {
  try {
    const data = readFileSync(join(__dirname, 'data', 'users.json'), 'utf8');
    const db = JSON.parse(data);
    res.json(db.users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.get('/api/users/auth', async (req, res) => {
  try {
    const users = getUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log('Datos recibidos:', req.body);
    
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password y role son requeridos' });
    }
    
    const newUser = await createUser({ username, password, role });
    io.emit('usersUpdate'); // Notificar a todos los clientes
    res.json(newUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(400).json({ error: error.message || 'Error al crear usuario' });
  }
});

/*
app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, password, role } = req.body;
    console.log('Update user data:', req.body);

    if (!username || !role) {
      return res.status(400).json({ error: 'Username y role son requeridos' });
    }

    const { updateUser } = await import('./databases/users.js');
    const updated = await updateUser(userId, { username, password, role });
    io.emit('usersUpdate');
    res.json(updated);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({ error: error.message || 'Error al actualizar usuario' });
  }
});*/
app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await deleteUser(userId);
    io.emit('usersUpdate'); // Notificar a todos los clientes
    res.json(result);
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(400).json({ error: error.message || 'Error al eliminar usuario' });
  }
});

// Match management endpoints
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await getMatches();
    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Error al obtener matches' });
  }
});

app.post('/api/matches', async (req, res) => {
  try {
    const matchData = req.body;
    const newMatch = await createMatch(matchData);
    io.emit('matchesUpdate'); // Notificar a todos los clientes
    res.json(newMatch);
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ error: error.message || 'Error al crear match' });
  }
});

// Bracket management endpoints
app.get('/api/brackets', async (req, res) => {
  try {
    const brackets = await getBrackets();
    res.json(brackets);
  } catch (error) {
    console.error('Get brackets error:', error);
    res.status(500).json({ error: 'Error al obtener brackets' });
  }
});

app.post('/api/brackets', async (req, res) => {
  try {
    const bracketData = req.body;
    const newBracket = await createBracket(bracketData);
    io.emit('bracketsUpdate'); // Notificar a todos los clientes
    res.json(newBracket);
  } catch (error) {
    console.error('Create bracket error:', error);
    res.status(500).json({ error: error.message || 'Error al crear bracket' });
  }
});

// Timer endpoints
app.get('/api/timer', async (req, res) => {
  try {
    const timer = await getTimer();
    res.json(timer);
  } catch (error) {
    console.error('Get timer error:', error);
    res.status(500).json({ error: 'Error al obtener timer' });
  }
});

app.get('/api/', async (req, res) => {
  try {
    const timer = await getTimer();
    const users = getUsers();
    const matches = await getMatches();
    const brackets = await getBrackets();
    
    res.json({
      timer,
      users,
      matches,
      brackets
    });
  } catch (error) {
    console.error('Get all data error:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

app.post('/api/brackets/generate', async (req, res) => {
  try {

    const { size, name } = req.body;

    const teams = shuffle(getTeams()).slice(0, size);

    if (teams.length < size) {
      return res.status(400).json({ error: "No hay suficientes equipos" });
    }

    const bracket = await createBracket({
      name: name || `Bracket ${size}`,
      size,
      status: "active"
    });

    const bracketId = bracket.id;

    const rounds = Math.log2(size);
    const matches = [];

    let matchId = 1;

    for (let round = 1; round <= rounds; round++) {

      const matchesInRound = size / Math.pow(2, round);

      for (let position = 1; position <= matchesInRound; position++) {

        let teamA = "";
        let teamB = "";

        if (round === 1) {
          teamA = teams.shift().number;
          teamB = teams.shift().number;
        }

        const nextMatchPosition = Math.ceil(position / 2);

        const nextMatchId =
          round === rounds
            ? null
            : `match-${round + 1}-${nextMatchPosition}`;

        const match = await createMatch({
          id: `match-${round}-${position}`,
          bracketId,
          round,
          position,
          nextMatchId,
          teamA,
          teamB,
          scoreA: 0,
          scoreB: 0,
          status: "pending"
        });

        matches.push(match);

      }

    }

    io.emit('bracketsUpdate');
    io.emit('matchesUpdate');

    res.json({
      bracket,
      matches
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error generando bracket"
    });

  }
});

app.put('/api/matches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const matchData = req.body;

    // --- NUEVA LÓGICA DE CÁLCULO DE MISIONES ---
    // Si el objeto enviado contiene misiones para el Equipo A, calculamos su score
    if (matchData.missionsA) {
      matchData.scoreA = calculateFLLScore(matchData.missionsA);
    }
    
    // Si contiene misiones para el Equipo B, calculamos su score
    if (matchData.missionsB) {
      matchData.scoreB = calculateFLLScore(matchData.missionsB);
    }
    // -------------------------------------------

    // 1. Actualizar el match actual (ahora con los scores calculados por el servidor)
    const updatedMatch = await updateMatch(id, matchData);

    // 2. Lógica de avance automático si el match ha finalizado
    if (updatedMatch.status === 'finished' && updatedMatch.nextMatchId) {
      let winner = null;
      if (updatedMatch.scoreA > updatedMatch.scoreB) {
        winner = updatedMatch.teamA;
      } else if (updatedMatch.scoreB > updatedMatch.scoreA) {
        winner = updatedMatch.teamB;
      }

      if (winner) {
        // Regla: Impar (1, 3, 5...) va al Team A. Par (2, 4, 6...) va al Team B.
        const isTeamA = updatedMatch.position % 2 !== 0;
        
        const updateData = isTeamA 
          ? { teamA: winner } 
          : { teamB: winner };

        // Actualizar el siguiente match en la base de datos
        await updateMatch(updatedMatch.nextMatchId, updateData);
      }
    }

    // 3. Emitir eventos para que todos los clientes vean los cambios
    io.emit('matchesUpdate');
    io.emit('bracketsUpdate');

    res.json(updatedMatch);
  } catch (error) {
    console.error('Error actualizando match:', error);
    res.status(500).json({ error: 'Error actualizando match', details: error.message });
  }
});

app.get('/api/matches/:id', async (req, res) => {
  try {
    const match = await getMatchById(req.params.id);
    res.json(match);
  } catch (error) {
    console.error('Error obteniendo match:', error);
    res.status(404).json({ error: 'Match no encontrado' });
  }
});

let timerInterval = null;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Handle heartbeat to keep connection alive
  socket.on('heartbeat', () => {
    socket.emit('heartbeat_response');
  });
  
  // Send initial timer state
  const sendTimerUpdate = async () => {
    try {
      const timer = await getTimer();
      socket.emit('timerUpdate', timer);
    } catch (error) {
      console.error('Error sending timer update:', error);
    }
  };
  
  sendTimerUpdate();
  
  // Handle getTimer request
  socket.on('getTimer', sendTimerUpdate);
  
  socket.on('updateTimer', async (data) => {
    try {
      const timer = await updateTimer(data);
      io.emit('timerUpdate', timer);
    } catch (error) {
      console.error('Error updating timer:', error);
    }
  });

  socket.on('startTimer', async () => {
    try {
      const timer = await updateTimer({ isRunning: true });
      io.emit('timerUpdate', timer);
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  });
  
  socket.on('pauseTimer', async () => {
    try {
      const timer = await updateTimer({ isRunning: false });
      io.emit('timerUpdate', timer);
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  });
  
  socket.on('resetTimer', async () => {
    try {
      const timer = await updateTimer({ timeRemaining: 150, isRunning: false });
      io.emit('timerUpdate', timer);
    } catch (error) {
      console.error('Error resetting timer:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

const startServer = async () => {
  const PORT = 3000;
  
  if (!(await checkPort(PORT))) {
    console.error('Port 3000 is already in use. Please free it and try again.');
    process.exit(1);
  }
  
  // Initialize databases before starting server
  await initializeDatabases();
  
  httpServer.listen(PORT, '0.0.0.0', () => {
    const localIP = ip.address();
    console.log(`LEGO Timer Server running on:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Network: http://${localIP}:${PORT}`);
    console.log(`\nAccess LEGO timer from any device on your network using Network URL.`);
    console.log(`\nDefault admin credentials:`);
    console.log(`- Username: admin`);
    console.log(`- Password: admin123`);
  });
};

startServer();