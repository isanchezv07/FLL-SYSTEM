import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// -----------------------------------------
// Paths
// -----------------------------------------

let currentDir;
if (typeof __dirname !== 'undefined') {
  currentDir = __dirname;
} else {
  currentDir = dirname(fileURLToPath(import.meta.url));
}
const dataDir = join(currentDir, '..', 'data');
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

  // Limpieza de campos redundantes en partidos existentes
  if (db.data.matches && Array.isArray(db.data.matches)) {
    db.data.matches = db.data.matches.map(m => {
      // Extraemos solo lo que queremos conservar
      const { 
        id, bracketId, round, position, 
        teamA1, teamA2, teamB1, teamB2, 
        scoreA, scoreB, status, nextMatchId, 
        missionsA1, missionsA2, missionsB1, missionsB2, 
        date 
      } = m;
      
      return {
        id, bracketId: bracketId || "", round: round || 1, position: position || 1,
        teamA1: teamA1 || "", teamA2: teamA2 || "", 
        teamB1: teamB1 || "", teamB2: teamB2 || "",
        scoreA: scoreA || 0, scoreB: scoreB || 0,
        status: status || "pending", nextMatchId: nextMatchId || null,
        missionsA1: missionsA1 || {}, missionsA2: missionsA2 || {},
        missionsB1: missionsB1 || {}, missionsB2: missionsB2 || {},
        date: date || new Date().toISOString()
      };
    });
  }

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
    bracketId: "",
    round: 1,
    position: 1,
    teamA1: "",
    teamA2: "",
    teamB1: "",
    teamB2: "",
    scoreA: 0,
    scoreB: 0,
    status: "pending",
    nextMatchId: null,
    missionsA1: {},
    missionsA2: {},
    missionsB1: {},
    missionsB2: {},
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

export const resetMatches = async () => {
  await db.read();
  db.data.matches = [];
  await db.write();
  return { success: true };
};

export default db;