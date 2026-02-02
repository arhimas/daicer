import { spawn } from 'child_process';

// Command: NODE_OPTIONS='--max-old-space-size=8192' strapi ts:generate-types
const cmd = 'strapi';
const args = ['ts:generate-types'];

console.log('🚀 Starting Codegen Wrapper...');

const child = spawn(cmd, args, {
  stdio: ['ignore', 'pipe', 'pipe'], // We need to read stdout
  shell: true,
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=8192',
  },
});

let success = false;

child.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output); // Passthrough

  if (output.includes('The task completed successfully')) {
    console.log('\n✅ Codegen success detected. Force exiting in 1s...');
    success = true;
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

child.on('close', (code) => {
  if (!success) {
    console.log(`\nChild process exited with code ${code}`);
    process.exit(code || 0);
  }
});

// Force kill if it takes too long (e.g. 60s)
setTimeout(() => {
  if (!success) {
    console.error('\n❌ Codegen timed out (60s).');
    child.kill();
    process.exit(1);
  }
}, 60000);
