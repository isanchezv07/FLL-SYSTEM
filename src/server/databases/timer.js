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
    displayMode: 'live',
    layoutPosition: 'top',
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
        displayMode: 'live',
        layoutPosition: 'top',
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
    // Limpieza agresiva: si existe allianceSelection, la quitamos
    if (db.data.timer.allianceSelection) {
      delete db.data.timer.allianceSelection;
    }
    // Asegurar que existan las propiedades nuevas si es una base de datos vieja
    if (db.data.timer.fieldCount === undefined) db.data.timer.fieldCount = 4;
    if (db.data.timer.displayMode === undefined) db.data.timer.displayMode = 'live';
    if (db.data.timer.layoutPosition === undefined) db.data.timer.layoutPosition = 'top';
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
  // Doble check de limpieza al leer
  if (db.data.timer.allianceSelection) {
    delete db.data.timer.allianceSelection;
    await db.write();
  }
  return db.data.timer;
};

export const updateTimer = async (timerData) => {
  await db.read();
  
  // Lista blanca de propiedades permitidas para el timer
  const allowedKeys = ['timeRemaining', 'isRunning', 'fieldCount', 'fields', 'displayMode', 'layoutPosition'];
  const cleanIncomingData = {};
  
  allowedKeys.forEach(key => {
    if (timerData[key] !== undefined) {
      cleanIncomingData[key] = timerData[key];
    }
  });

  // Reconstruir el objeto timer solo con propiedades permitidas de forma EXPLÍCITA
  const currentTimer = db.data.timer;
  db.data = {
    timer: {
      timeRemaining: cleanIncomingData.timeRemaining !== undefined ? cleanIncomingData.timeRemaining : currentTimer.timeRemaining,
      isRunning: cleanIncomingData.isRunning !== undefined ? cleanIncomingData.isRunning : currentTimer.isRunning,
      displayMode: cleanIncomingData.displayMode !== undefined ? cleanIncomingData.displayMode : currentTimer.displayMode,
      layoutPosition: cleanIncomingData.layoutPosition !== undefined ? cleanIncomingData.layoutPosition : currentTimer.layoutPosition,
      fieldCount: cleanIncomingData.fieldCount !== undefined ? cleanIncomingData.fieldCount : currentTimer.fieldCount,
      fields: cleanIncomingData.fields !== undefined ? cleanIncomingData.fields : currentTimer.fields,
      updatedAt: new Date().toISOString()
    }
  };
  
  await db.write();
  return db.data.timer;
};

export const resetTimer = async () => {
  await db.read();
  
  db.data.timer = {
    timeRemaining: 150,
    isRunning: false,
    displayMode: db.data.timer.displayMode || 'live',
    layoutPosition: db.data.timer.layoutPosition || 'top',
    fieldCount: db.data.timer.fieldCount || 4,
    fields: db.data.timer.fields || {},
    updatedAt: new Date().toISOString()
  };
  
  await db.write();
  return db.data.timer;
};

export default db;
