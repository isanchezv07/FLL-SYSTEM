import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'timer.json');

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { 
  timer: {
    timeRemaining: 150,
    isRunning: false
  }
});

// Initialize database
export const initTimerDB = async () => {
  await db.read();
  if (!db.data) {
    db.data = { 
      timer: {
        timeRemaining: 150,
        isRunning: false
      }
    };
    await db.write();
  }
};

// Timer operations
export const getTimer = async () => {
  await db.read();
  return db.data.timer;
};

export const updateTimer = async (timerData) => {
  await db.read();
  
  db.data.timer = {
    ...db.data.timer,
    ...timerData,
    updatedAt: new Date().toISOString()
  };
  
  await db.write();
  return db.data.timer;
};

export const resetTimer = async () => {
  await db.read();
  
  db.data.timer = {
    timeRemaining: 150,
    isRunning: false,
    updatedAt: new Date().toISOString()
  };
  
  await db.write();
  return db.data.timer;
};

export default db;
