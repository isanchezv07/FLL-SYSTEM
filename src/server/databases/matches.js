import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'matches.json');

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { matches: [] });

// Initialize database
export const initMatchesDB = async () => {
  await db.read();
  if (!db.data) {
    db.data = { matches: [] };
    await db.write();
  }
};

// Match operations
export const getMatches = async () => {
  await db.read();
  return db.data.matches || [];
};

export const createMatch = async (matchData) => {
  await db.read();
  
  const newMatch = {
    id: Date.now().toString(),
    ...matchData,
    date: new Date().toISOString()
  };
  
  db.data.matches.push(newMatch);
  await db.write();
  
  return newMatch;
};

export const updateMatch = async (matchId, matchData) => {
  await db.read();
  const matchIndex = db.data.matches.findIndex(m => m.id === matchId);
  
  if (matchIndex === -1) {
    throw new Error('Match no encontrado');
  }
  
  db.data.matches[matchIndex] = {
    ...db.data.matches[matchIndex],
    ...matchData,
    updatedAt: new Date().toISOString()
  };
  
  await db.write();
  return db.data.matches[matchIndex];
};

export const deleteMatch = async (matchId) => {
  await db.read();
  const matchIndex = db.data.matches.findIndex(m => m.id === matchId);
  
  if (matchIndex === -1) {
    throw new Error('Match no encontrado');
  }
  
  db.data.matches.splice(matchIndex, 1);
  await db.write();
  
  return { success: true };
};

export const getMatchById = async (matchId) => {
  await db.read();
  const match = db.data.matches.find(m => m.id === matchId);
  
  if (!match) {
    throw new Error('Match no encontrado');
  }
  
  return match;
};

export default db;
