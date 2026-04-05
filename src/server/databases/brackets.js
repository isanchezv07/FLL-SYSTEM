import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

let currentDir;
if (typeof __dirname !== 'undefined') {
  currentDir = __dirname;
} else {
  currentDir = dirname(fileURLToPath(import.meta.url));
}
const dbPath = join(currentDir, '..', 'data', 'brackets.json');

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { brackets: [] });

// Initialize database
export const initBracketsDB = async () => {
  await db.read();
  if (!db.data) {
    db.data = { brackets: [] };
    await db.write();
  }
};

// Bracket operations
export const getBrackets = async () => {
  await db.read();
  return db.data.brackets || [];
};

export const createBracket = async (bracketData) => {
  await db.read();
  
  const newBracket = {
    id: Date.now().toString(),
    ...bracketData,
    createdAt: new Date().toISOString()
  };
  
  db.data.brackets.push(newBracket);
  await db.write();
  
  return newBracket;
};

export const updateBracket = async (bracketId, bracketData) => {
  await db.read();
  const bracketIndex = db.data.brackets.findIndex(b => b.id === bracketId);
  
  if (bracketIndex === -1) {
    throw new Error('Bracket no encontrado');
  }
  
  db.data.brackets[bracketIndex] = {
    ...db.data.brackets[bracketIndex],
    ...bracketData,
    updatedAt: new Date().toISOString()
  };
  
  await db.write();
  return db.data.brackets[bracketIndex];
};

export const deleteBracket = async (bracketId) => {
  await db.read();
  const bracketIndex = db.data.brackets.findIndex(b => b.id === bracketId);
  
  if (bracketIndex === -1) {
    throw new Error('Bracket no encontrado');
  }
  
  db.data.brackets.splice(bracketIndex, 1);
  await db.write();
  
  return { success: true };
};

export const getBracketById = async (bracketId) => {
  await db.read();
  const bracket = db.data.brackets.find(b => b.id === bracketId);
  
  if (!bracket) {
    throw new Error('Bracket no encontrado');
  }
  
  return bracket;
};

export const addMatchToBracket = async (bracketId, matchData) => {
  await db.read();
  const bracketIndex = db.data.brackets.findIndex(b => b.id === bracketId);
  
  if (bracketIndex === -1) {
    throw new Error('Bracket no encontrado');
  }
  
  if (!db.data.brackets[bracketIndex].matches) {
    db.data.brackets[bracketIndex].matches = [];
  }
  
  const newMatch = {
    id: Date.now().toString(),
    ...matchData,
    date: new Date().toISOString()
  };
  
  db.data.brackets[bracketIndex].matches.push(newMatch);
  await db.write();
  
  return newMatch;
};

export default db;
