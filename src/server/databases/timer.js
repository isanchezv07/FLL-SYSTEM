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
const dbPath = join(currentDir, '..', 'data', 'timer.json');

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { 
  timer: {
    timeRemaining: 150,
    isRunning: false,
    fieldCount: 4,
    fields: {
      "cancha1": null,
      "cancha2": null,
      "cancha3": null,
      "cancha4": null
    }
  }
});

// Initialize database
export const initTimerDB = async () => {
  await db.read();
  if (!db.data || !db.data.timer) {
    db.data = { 
      timer: {
        timeRemaining: 150,
        isRunning: false,
        fieldCount: 4,
        fields: {
          "cancha1": null,
          "cancha2": null,
          "cancha3": null,
          "cancha4": null
        }
      }
    };
    await db.write();
  } else {
    // Asegurar que existan las propiedades nuevas si es una base de datos vieja
    if (db.data.timer.fieldCount === undefined) db.data.timer.fieldCount = 4;
    if (!db.data.timer.fields) {
      db.data.timer.fields = {};
      for (let i = 1; i <= db.data.timer.fieldCount; i++) {
        db.data.timer.fields[`cancha${i}`] = null;
      }
    }
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
