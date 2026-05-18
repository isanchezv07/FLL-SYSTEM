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
  enabled: false
};

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, defaultData);

export const initQualisDB = async () => {
  await db.read();
  
  // Si no hay datos o es un array (error común), resetear a objeto
  if (!db.data || Array.isArray(db.data)) {
    db.data = { ...defaultData };
  }
  
  // Asegurar que todos los campos existen
  if (db.data.enabled === undefined) db.data.enabled = false;
  if (db.data.currentIndex === undefined) db.data.currentIndex = -1;
  if (db.data.matches === undefined) db.data.matches = [];
  
  await db.write();
};

export const getQualis = async () => {
  await db.read();
  // Doble check por si acaso
  if (!db.data || Array.isArray(db.data)) return defaultData;
  return db.data;
};

export const updateQualis = async (data) => {
  await db.read();
  console.log('[QUALIS DB] Recibiendo datos para actualizar:', JSON.stringify(data).substring(0, 100) + '...');
  if (!db.data || Array.isArray(db.data)) db.data = { ...defaultData };
  db.data = { ...db.data, ...data };
  await db.write();
  console.log('[QUALIS DB] Datos escritos en disco. Total matches:', db.data.matches?.length);
  return db.data;
};

export const setQualisEnabled = async (enabled) => {
  await db.read();
  console.log('[QUALIS DB] Cambiando enabled a:', enabled);
  if (!db.data || Array.isArray(db.data)) db.data = { ...defaultData };
  db.data.enabled = enabled;
  await db.write();
  return db.data;
};

export const updateQualisMatch = async (index, data) => {
  await db.read();
  if (!db.data || Array.isArray(db.data)) db.data = { ...defaultData };
  if (db.data.matches && db.data.matches[index]) {
    db.data.matches[index] = { ...db.data.matches[index], ...data };
    await db.write();
  }
  return db.data;
};

export const nextQualisMatch = async () => {
  await db.read();
  if (!db.data || Array.isArray(db.data)) db.data = { ...defaultData };
  if (db.data.matches && db.data.currentIndex < db.data.matches.length - 1) {
    db.data.currentIndex++;
    await db.write();
  }
  return db.data;
};

export const prevQualisMatch = async () => {
  await db.read();
  if (!db.data || Array.isArray(db.data)) db.data = { ...defaultData };
  if (db.data.matches && db.data.currentIndex > 0) {
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

export default db;