import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getTeams } from './teams.js';

let currentDir;
if (typeof __dirname !== 'undefined') {
  currentDir = __dirname;
} else {
  currentDir = dirname(fileURLToPath(import.meta.url));
}
const dbPath = join(currentDir, '..', 'data', 'alliances.json');

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { 
  active: false,
  alliances: []
});

export const initAlliancesDB = async () => {
  await db.read();
  if (!db.data || !db.data.alliances) {
    console.log('[DB] Inicializando alliances.json...');
    db.data = { 
      active: false,
      alliances: []
    };
    await db.write();
  } else {
    console.log('[DB] alliances.json cargado correctamente.');
  }
};

export const getAlliances = async () => {
  await db.read();
  const teams = getTeams();
  // Enriquecer las alianzas con los nombres de equipo y países actuales
  const enrichedAlliances = (db.data.alliances || []).map(a => ({
    ...a,
    teamNames: (a.teams || []).map(num => teams.find(t => t.number === num)?.name || `Equipo ${num}`),
    teamCountries: (a.teams || []).map(num => teams.find(t => t.number === num)?.country || 'Unknown')
  }));
  
  return {
    ...db.data,
    alliances: enrichedAlliances
  };
};

export const updateAlliances = async (data) => {
  await db.read();
  
  // Guardar las alianzas tal cual vienen (incluyendo teamNames si el front los manda)
  let alliancesToSave = db.data.alliances || [];
  if (data.alliances) {
    alliancesToSave = data.alliances;
  }

  // Asegurarnos de que tenemos la estructura correcta mezclando con lo existente
  db.data = {
    ...db.data,
    active: data.active !== undefined ? data.active : db.data.active,
    alliances: alliancesToSave,
    updatedAt: new Date().toISOString()
  };
  
  await db.write();
  return getAlliances(); // Retornar la versión enriquecida (que ahora coincidirá con lo guardado)
};

export const resetAlliances = async () => {
  db.data = {
    active: false,
    alliances: []
  };
  await db.write();
  return db.data;
};
