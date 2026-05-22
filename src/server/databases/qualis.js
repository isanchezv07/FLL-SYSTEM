import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

let currentDir;
if (typeof __dirname !== 'undefined') {
  currentDir = __dirname;
} else {
  currentDir = dirname(fileURLToPath(import.meta.url));
}
const dataDir = join(currentDir, '..', 'data');
const dbPath = join(dataDir, 'qualis.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultData = {
  matches: [],
  currentIndex: -1,
  enabled: false,
  pool: {}
};

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, defaultData);

// NORMALIZADOR MAESTRO
// Convierte CUALQUIER formato de alianza al formato estándar interno [2vs2]
export const normalizeAlliance = (raw) => {
  if (!raw) return { teams: [], teamNames: [], teamCountries: [] };
  
  // Caso 1: Ya es formato interno
  if (Array.isArray(raw.teams)) return raw;

  // Caso 2: Formato objeto del usuario (alianzaX: { team1, team2... })
  if (raw.team1 || raw.team2) {
    return {
        teams: [raw.team1, raw.team2].filter(Boolean).map(String),
        teamNames: [raw.name1, raw.name2].filter(v => v !== undefined && v !== null).map(String),
        teamCountries: [raw.country1, raw.country2].filter(v => v !== undefined && v !== null).map(String)
    };
  }

  return { teams: [], teamNames: [], teamCountries: [] };
};

// Normaliza un match completo (asegura que tenga alliance1, alliance2, etc)
const normalizeMatch = (m) => {
    // Si es formato viejo plano (team1, team2)
    if (m.team1 && !m.alliance1) {
        return {
            alliance1: [m.team1],
            allianceNames1: [m.name1 || `Team ${m.team1}`],
            allianceCountries1: [m.country1 || ''],
            alliance2: [m.team2],
            allianceNames2: [m.name2 || `Team ${m.team2}`],
            allianceCountries2: [m.country2 || ''],
            winner: m.winner === m.team1 ? '1' : (m.winner === m.team2 ? '2' : null)
        };
    }

    // Si es el formato del usuario incrustado (alianza1: { ... }, alianza2: { ... })
    if (m.alianza1 && typeof m.alianza1 === 'object') {
        const a1 = normalizeAlliance(m.alianza1);
        const a2 = normalizeAlliance(m.alianza2);
        return {
            alliance1: a1.teams,
            allianceNames1: a1.teamNames,
            allianceCountries1: a1.teamCountries,
            alliance2: a2.teams,
            allianceNames2: a2.teamNames,
            allianceCountries2: a2.teamCountries,
            winner: m.winner
        };
    }

    // Asegurar que existan los arrays si ya es formato nuevo
    return {
        ...m,
        alliance1: m.alliance1 || [],
        allianceNames1: m.allianceNames1 || [],
        allianceCountries1: m.allianceCountries1 || [],
        alliance2: m.alliance2 || [],
        allianceNames2: m.allianceNames2 || [],
        allianceCountries2: m.allianceCountries2 || [],
        winner: m.winner || null
    };
};

export const initQualisDB = async () => {
  await db.read();
  if (!db.data || Array.isArray(db.data)) {
    db.data = { ...defaultData };
  }
  await sanitizeAndWrite();
};

const sanitizeAndWrite = async () => {
    if (!db.data) return;
    
    // Normalizar todos los matches
    if (Array.isArray(db.data.matches)) {
        db.data.matches = db.data.matches.map(normalizeMatch);
    }

    // Normalizar el pool
    if (db.data.pool) {
        const cleanPool = {};
        Object.entries(db.data.pool).forEach(([key, val]) => {
            cleanPool[key] = normalizeAlliance(val);
        });
        db.data.pool = cleanPool;
    }

    if (db.data.currentIndex === undefined) db.data.currentIndex = -1;
    if (db.data.enabled === undefined) db.data.enabled = false;

    await db.write();
};

export const getQualis = async () => {
  await db.read();
  return db.data;
};

export const updateQualis = async (data) => {
  await db.read();
  db.data = { ...db.data, ...data };
  await sanitizeAndWrite();
  return db.data;
};

export const updateQualisMatch = async (index, data) => {
  await db.read();
  if (db.data.matches && db.data.matches[index]) {
    // Fusionar y luego volver a normalizar para estar seguros
    db.data.matches[index] = normalizeMatch({ ...db.data.matches[index], ...data });
    await db.write();
  }
  return db.data;
};

export const setQualisEnabled = async (enabled) => {
  await db.read();
  db.data.enabled = enabled;
  await db.write();
  return db.data;
};

export const nextQualisMatch = async () => {
  await db.read();
  if (db.data.currentIndex < db.data.matches.length - 1) {
    db.data.currentIndex++;
    await db.write();
  }
  return db.data;
};

export const prevQualisMatch = async () => {
  await db.read();
  if (db.data.currentIndex > 0) {
    db.data.currentIndex--;
    await db.write();
  }
  return db.data;
};

export const resetQualis = async () => {
  await db.read();
  db.data = { ...defaultData };
  await db.write();
  return db.data;
};
