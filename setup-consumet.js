import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directory where we'll clone the repository
const consumetDir = path.join(__dirname, 'consumet-api');

console.log('Setting up Consumet API server...');

// Check if the directory already exists
if (fs.existsSync(consumetDir)) {
  console.log('Consumet API directory already exists. Updating...');
  try {
    // Navigate to the directory and pull the latest changes
    process.chdir(consumetDir);
    execSync('git pull', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error updating Consumet API:', error);
    process.exit(1);
  }
} else {
  console.log('Cloning Consumet API repository...');
  try {
    // Clone the repository
    execSync('git clone https://github.com/consumet/api.git consumet-api', { stdio: 'inherit' });
    process.chdir(consumetDir);
  } catch (error) {
    console.error('Error cloning Consumet API repository:', error);
    process.exit(1);
  }
}

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

// Create a .env file if it doesn't exist
const envPath = path.join(consumetDir, '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file...');
  fs.writeFileSync(envPath, 'PORT=3001\n');
}

console.log('Consumet API setup complete!');
console.log('To start the server, run:');
console.log('cd consumet-api && npm start');
