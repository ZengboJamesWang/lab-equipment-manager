#!/usr/bin/env node

/**
 * Cross-Platform Development Startup Script for LabManager
 * Works on Windows, macOS, and Linux
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');
const { promisify } = require('util');

const execAsync = promisify(exec);
const platform = os.platform();
const isWindows = platform === 'win32';

console.log('==================================================');
console.log('🚀 Laboratory Equipment Management System');
console.log('==================================================');
console.log('🔧 MODE: DEVELOPMENT');
console.log(`📊 Platform: ${platform}`);
console.log(`📁 Working Directory: ${__dirname}`);
console.log('==================================================\n');

// Function to kill process on a specific port
async function killPort(port) {
  console.log(`🔍 Checking for processes on port ${port}...`);

  try {
    if (isWindows) {
      // Windows: Find and kill process using port
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split('\n');
      const pids = new Set();

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            pids.add(pid);
          }
        }
      });

      if (pids.size > 0) {
        console.log(`⚠️  Found ${pids.size} process(es) on port ${port}, terminating...`);
        for (const pid of pids) {
          try {
            await execAsync(`taskkill //F //PID ${pid}`);
            console.log(`✅ Killed process ${pid}`);
          } catch (err) {
            // Process might have already terminated
          }
        }
        // Wait for port to be released
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`✅ Port ${port} is now available`);
      } else {
        console.log(`✅ Port ${port} is available`);
      }
    } else {
      // Linux/macOS: Find and kill process using port
      try {
        const { stdout } = await execAsync(`lsof -ti:${port}`);
        const pids = stdout.trim().split('\n').filter(pid => pid);

        if (pids.length > 0) {
          console.log(`⚠️  Found ${pids.length} process(es) on port ${port}, terminating...`);
          for (const pid of pids) {
            await execAsync(`kill -9 ${pid}`);
            console.log(`✅ Killed process ${pid}`);
          }
          // Wait for port to be released
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log(`✅ Port ${port} is now available`);
        } else {
          console.log(`✅ Port ${port} is available`);
        }
      } catch (err) {
        // No process found on port
        console.log(`✅ Port ${port} is available`);
      }
    }
  } catch (error) {
    // Port is likely free
    console.log(`✅ Port ${port} is available`);
  }
}

// Main startup function
async function startServers() {
  // Kill processes on ports 5000 and 3000 (dev mode uses 3000 for frontend)
  await killPort(5000);
  await killPort(3000);

  console.log('\n==================================================');
  console.log('🔧 Starting backend development server...');
  const backendDir = path.join(__dirname, '..', 'backend');

  const backendCommand = isWindows ? 'npm.cmd' : 'npm';
  const backendArgs = ['run', 'dev'];
  const backendOptions = {
    cwd: backendDir,
    stdio: 'inherit',
    shell: isWindows
  };

  const backend = spawn(backendCommand, backendArgs, backendOptions);

  backend.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
    process.exit(1);
  });

  // Give backend a moment to start
  setTimeout(() => {
    console.log('\n🎨 Starting frontend development server...');
    const frontendDir = path.join(__dirname, '..', 'frontend');

    const frontendCommand = isWindows ? 'npm.cmd' : 'npm';
    const frontendArgs = ['run', 'dev'];
    const frontendOptions = {
      cwd: frontendDir,
      stdio: 'inherit',
      shell: isWindows
    };

    const frontend = spawn(frontendCommand, frontendArgs, frontendOptions);

    frontend.on('error', (error) => {
      console.error('❌ Failed to start frontend:', error.message);
      backend.kill();
      process.exit(1);
    });

    // Handle process termination
    const cleanup = () => {
      console.log('\n\n🛑 Shutting down development servers...');
      backend.kill();
      frontend.kill();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);

  }, 2000);

  console.log('\n📝 Development logs will appear below:\n');
  console.log('==================================================\n');
}

// Start the servers
startServers().catch(error => {
  console.error('❌ Startup failed:', error.message);
  process.exit(1);
});
