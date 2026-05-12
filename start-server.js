// Robust script to start both the Astro frontend and the Express backend
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ip from 'ip';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, 'src', 'server', 'server.js');
const entryPath = join(__dirname, 'dist', 'server', 'entry.mjs');

// Ensure production check is reliable
const isProd = process.env.NODE_ENV === 'production';

console.log(`\n--- FLL SYSTEM BOOTSTRAP ---`);
console.log(`Environment: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);

// 1. Start the backend server
console.log(`[Backend] Starting Express server at ${serverPath}...`);
const backend = spawn('node', [serverPath], { 
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: isProd ? 'production' : 'development' }
});

backend.on('error', (err) => {
  console.error(`[Backend] Failed to start:`, err);
});

// 2. Start the Astro frontend
let frontend;
if (isProd) {
  if (fs.existsSync(entryPath)) {
    console.log(`[Frontend] Starting Astro SSR production server at ${entryPath}...`);
    frontend = spawn('node', [entryPath], { 
      stdio: 'inherit',
      env: { ...process.env, PORT: '4321', HOST: '0.0.0.0' }
    });
  } else {
    console.error(`[Frontend] Error: Build entry point not found at ${entryPath}`);
    console.log(`[Frontend] Attempting fallback to 'npm run preview'...`);
    frontend = spawn('npm', ['run', 'preview'], { 
      stdio: 'inherit', 
      shell: true,
      env: { ...process.env, PORT: '4321', HOST: '0.0.0.0' }
    });
  }
} else {
  console.log(`[Frontend] Starting Astro dev server...`);
  frontend = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit', 
    shell: true,
    env: { ...process.env, PORT: '4321', HOST: '0.0.0.0' }
  });
}

frontend.on('error', (err) => {
  console.error(`[Frontend] Failed to start:`, err);
});

// 3. START LOCALTUNNEL
console.log(`[Tunnel] Starting LocalTunnel on port 4321...`);
const tunnel = spawn(
  'npx',
  ['localtunnel', '--port', '4321'],
  {
    stdio: 'inherit',
    shell: true
  }
);

tunnel.on('error', (err) => {
  console.error(`[Tunnel] Failed to start:`, err);
});

// 3. Status display
const localIP = ip.address();
const isDocker = process.env.IS_DOCKER === 'true' || localIP.startsWith('172.');

setTimeout(() => {
  console.log('\n=============================================');
  console.log('FLL System - Online Status');
  console.log('=============================================');
  if (isDocker) {
    console.log(`\nNOTE: Running inside Docker.`);
    console.log(`Access the system using your computer's IP:`);
    console.log(`- Main Scoreboard: http://localhost:4321/`);
    console.log(`- Backend API: http://localhost:3000/`);
  } else {
    console.log(`Access from network devices:`);
    console.log(`- Main Scoreboard: http://${localIP}:4321/`);
    console.log(`- Backend API: http://${localIP}:3000/`);
  }
  console.log('=============================================\n');
}, 3000);

// Handle shutdown gracefully
const shutdown = () => {
  console.log('\nShutting down servers...');
  if (backend) backend.kill();
  if (frontend) frontend.kill();
  if (tunnel) tunnel.kill();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
