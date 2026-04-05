// Simple script to start both the Astro frontend and the Express backend
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ip from 'ip';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, 'src', 'server', 'server.js');

// Start the backend server
console.log('Starting backend server...');
const backend = spawn('node', [serverPath], { stdio: 'inherit' });

// Start the Astro frontend (dev or production)
console.log('Starting Astro frontend...');
const isProd = process.env.NODE_ENV === 'production';
const frontendCmd = isProd ? 'node' : 'npm';
const frontendArgs = isProd ? ['./dist/server/entry.mjs'] : ['run', 'dev'];

const frontend = spawn(frontendCmd, frontendArgs, { stdio: 'inherit' , shell: !isProd});


// Log local network access info
const localIP = ip.address();
console.log('\n=============================================');
console.log('FTC Local Scoring System is running!');
console.log('=============================================');
console.log(`Access the system from any device on your network:`);
console.log(`- Main Scoreboard: http://${localIP}:4321/`);
console.log(`- Score Controller: http://${localIP}:4321/control`);
console.log(`\nDefault admin credentials:`);
console.log('- Username: admin');
console.log('- Password: admin123');
console.log('=============================================\n');

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});