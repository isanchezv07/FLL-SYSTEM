import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

let currentDir;
if (typeof __dirname !== 'undefined') {
  currentDir = __dirname;
} else {
  currentDir = dirname(fileURLToPath(import.meta.url));
}
const DB_PATH = join(currentDir, '..', 'data', 'teams.json');

// Asegurar que el archivo exista al iniciar
const initTeamsDB = () => {
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify({ teams: [] }, null, 2));
  }
};

// Obtener todos los equipos
export const getTeams = () => {
  try {
    initTeamsDB();
    const data = readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    return db.teams || [];
  } catch (error) {
    console.error('Error leyendo equipos:', error);
    return [];
  }
};

// Crear un nuevo equipo
export const createTeam = async (teamData) => {
  const teams = getTeams();
  
  const newTeam = {
    id: Date.now().toString(),
    number: teamData.number, // El número que usas en el bracket
    name: teamData.name,
    ...teamData
  };

  teams.push(newTeam);
  writeFileSync(DB_PATH, JSON.stringify({ teams }, null, 2));
  return newTeam;
};

// Actualizar un equipo
export const updateTeam = async (id, teamData) => {
  const teams = getTeams();
  const index = teams.findIndex(t => t.id === id);
  if (index === -1) return null;

  teams[index] = { ...teams[index], ...teamData };
  writeFileSync(DB_PATH, JSON.stringify({ teams }, null, 2));
  return teams[index];
};

// Eliminar un equipo
export const deleteTeam = async (id) => {
  const teams = getTeams();
  const filtered = teams.filter(t => t.id !== id);
  if (teams.length === filtered.length) return false;

  writeFileSync(DB_PATH, JSON.stringify({ teams: filtered }, null, 2));
  return true;
};

// Función adicional para buscar por número (útil para validaciones)
export const getTeamByNumber = (number) => {
  const teams = getTeams();
  return teams.find(t => t.number === number);
};

initTeamsDB();