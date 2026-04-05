import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

let currentDir;
if (typeof __dirname !== 'undefined') {
  currentDir = __dirname;
} else {
  currentDir = dirname(fileURLToPath(import.meta.url));
}
const DB_PATH = join(currentDir, '..', 'data', 'awards.json');

const DEFAULT_AWARDS = {
  awards: [
    { id: '1', name: 'Core Values', teamNumber: '', teamName: '', revealedTitle: false, revealedWinner: false },
    { id: '2', name: 'Innovation Project', teamNumber: '', teamName: '', revealedTitle: false, revealedWinner: false },
    { id: '3', name: 'Robot Design', teamNumber: '', teamName: '', revealedTitle: false, revealedWinner: false },
    { id: '4', name: 'Robot Performance', teamNumber: '', teamName: '', revealedTitle: false, revealedWinner: false },
    { id: '5', name: 'Champion\'s Award', teamNumber: '', teamName: '', revealedTitle: false, revealedWinner: false }
  ],
  announcement: {
    text: '',
    active: false
  },
  ceremonyMode: false
};

export const initAwardsDB = () => {
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify(DEFAULT_AWARDS, null, 2));
  } else {
    // Migrate: check if new fields exist
    const data = JSON.parse(readFileSync(DB_PATH, 'utf8'));
    let changed = false;
    if (data.ceremonyMode === undefined) {
      data.ceremonyMode = false;
      changed = true;
    }
    data.awards = data.awards.map(award => {
      if (award.revealedTitle === undefined) {
        award.revealedTitle = award.revealed || false;
        award.revealedWinner = award.revealed || false;
        delete award.revealed;
        changed = true;
      }
      return award;
    });
    if (changed) {
      writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    }
  }
};

export const getAwards = () => {
  try {
    initAwardsDB();
    const data = readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.error('Error reading awards:', error);
    return DEFAULT_AWARDS;
  }
};

export const updateAward = async (id, data) => {
  const db = getAwards();
  const index = db.awards.findIndex(a => a.id === id);
  if (index !== -1) {
    db.awards[index] = { ...db.awards[index], ...data };
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    return db.awards[index];
  }
  throw new Error('Award not found');
};

export const updateAnnouncement = async (data) => {
  const db = getAwards();
  db.announcement = { ...db.announcement, ...data };
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  return db.announcement;
};

export const updateCeremonyMode = async (active) => {
  const db = getAwards();
  db.ceremonyMode = active;
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  return db.ceremonyMode;
};

export const resetAwards = async () => {
  writeFileSync(DB_PATH, JSON.stringify(DEFAULT_AWARDS, null, 2));
  return DEFAULT_AWARDS;
};

initAwardsDB();
