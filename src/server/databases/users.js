import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'users.json');

// Initialize database with default admin user if it doesn't exist
const initUsersDB = () => {
  try {
    const data = readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    
    if (!db.users || db.users.length === 0) {
      // Create default admin user
      const defaultAdmin = {
        id: '1',
        username: 'admin',
        password: "admin123",
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      
      db.users = [defaultAdmin];
      writeFileSync(dbPath, JSON.stringify(db, null, 2));
      console.log('Default admin user created');
    }
  } catch (error) {
    // File doesn't exist, create it with default admin
    const defaultAdmin = {
      id: '1',
      username: 'admin',
      password: "admin123",
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    
    const db = { users: [defaultAdmin] };
    writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('Users database created with default admin');
  }
};

// Initialize on module load
initUsersDB();

// User operations
export const getUsers = () => {
  try {
    const data = readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    return db.users.map(({ password, ...user }) => user);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

export const createUser = async (userData) => {
  try {
    const data = readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    
    // Check if user already exists
    if (db.users.find(u => u.username === userData.username)) {
      throw new Error('El usuario ya existe');
    }
    
    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      password: userData.password || "fll2026",
      role: userData.role,
      createdAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    writeFileSync(dbPath, JSON.stringify(db, null, 2));
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const data = readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    // Don't allow deleting admin users
    if (db.users[userIndex].role === 'admin') {
      throw new Error('No se puede eliminar un usuario admin');
    }
    
    db.users.splice(userIndex, 1);
    writeFileSync(dbPath, JSON.stringify(db, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const authenticateUser = async (username, password) => {
  try {
    console.log('Login attempt:', { username, password });
    const data = readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    const user = db.users.find(u => u.username === username);
    
    console.log('Found user:', user ? { id: user.id, username: user.username, password: user.password } : 'User not found');
    
    if (!user || user.password !== password) {
      console.log('Authentication failed:', { 
        userFound: !!user, 
        inputPassword: password, 
        storedPassword: user?.password,
        passwordsMatch: user?.password === password 
      });
      throw new Error('Credenciales inválidas');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};

export default {
  getUsers,
  createUser,
  deleteUser,
  authenticateUser
};
