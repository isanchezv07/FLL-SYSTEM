import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// -----------------------------------------
// Paths
// -----------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const dbPath = join(dataDir, 'matches.json');

// Crear carpeta /data si no existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// -----------------------------------------
// Default Data
// -----------------------------------------

const defaultData = {
  matches: []
};

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, defaultData);

// -----------------------------------------
// Initialize Database
// -----------------------------------------

export const initMatchesDB = async () => {
  await db.read();

  // Si el archivo está vacío o no existe
  db.data ||= defaultData;

  await db.write(); // 🔥 Esto crea el archivo automáticamente
};

// -----------------------------------------
// Match Operations
// -----------------------------------------

export const getMatches = async () => {
  await db.read();
  return db.data.matches;
};

export const createMatch = async (matchData) => {
  await db.read();

  const newMatch = {
    id: Date.now().toString(),
    round: "",
    // Misiones por equipo (se llena progresivamente desde el frontend)
    missionsA: {},
    missionsB: {},
    missions: {
      inspection: "",
      m01: { soil: 0, brushFree: 0 },
      m02: { topsoil: 0 },
      m03_04: { cart: 0, oppCart: 0, artifact: 0, supports: 0 },
      m05: { floor: 0 },
      m06: { ore: 0 },
      m07: { mill: 0 },
      m08: { pieces: 0 },
      m09: { roof: 0, wares: 0 },
      m10: { scale: 0, pan: 0 },
      m11: { artifacts: 0, flag: 0 },
      m12: { sand: 0, ship: 0 },
      m13: { statue: 0 },
      m14: {
        brush: 0,
        topsoil: 0,
        artifact: 0,
        oppCart: 0,
        oreArtifact: 0,
        mill: 0,
        pan: 0
      },
      m15: { flags: 0 }
    },
    precision: 0,
    total: 0,
    notes: "",
    date: new Date().toISOString(),
    ...matchData
  };

  db.data.matches.push(newMatch);
  await db.write();

  return newMatch;
};

export const updateMatch = async (matchId, matchData) => {
  await db.read();

  // Buscamos el índice comparando el ID tal cual viene
  const index = db.data.matches.findIndex(m => m.id === matchId);

  if (index === -1) {
    // Si no lo encuentra, lanzamos un error descriptivo para el log
    console.error(`ID buscado: "${matchId}" | IDs existentes:`, db.data.matches.map(m => m.id));
    throw new Error(`Match ${matchId} no encontrado en la base de datos`);
  }

  // Actualizamos manteniendo la integridad del ID
  db.data.matches[index] = {
    ...db.data.matches[index],
    ...matchData,
    id: matchId // Forzamos que el ID no cambie
  };

  await db.write();
  return db.data.matches[index];
};

export const deleteMatch = async (matchId) => {
  await db.read();

  const index = db.data.matches.findIndex(m => m.id === matchId);

  if (index === -1) {
    throw new Error('Match no encontrado');
  }

  db.data.matches.splice(index, 1);
  await db.write();

  return { success: true };
};

export const getMatchById = async (id) => {
  await db.read();
  const match = db.data.matches.find(m => m.id === id);
  if (!match) throw new Error('Match no encontrado');
  return match;
};

export default db;