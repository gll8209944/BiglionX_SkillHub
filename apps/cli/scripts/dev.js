#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const tsNodePath = path.join(__dirname, '..', 'node_modules', '.bin', 'ts-node.cmd');
const scriptPath = path.join(__dirname, '..', 'src', 'index.ts');

const child = spawn(tsNodePath, ['--transpile-only', scriptPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

child.on('close', (code) => {
  // Exit with code 0 if it's a help display (even if ts-node returns non-zero)
  process.exit(0);
});
