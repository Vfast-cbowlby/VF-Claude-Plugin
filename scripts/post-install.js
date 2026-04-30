#!/usr/bin/env node
'use strict';
// Runs automatically after `npm install vcp` or `npm install -g vcp`.
// Applies the core profile so hooks, rules, and agents land in ~/.claude/.
// Skips if this exact version was already applied (idempotent).

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const INSTALL_SCRIPT = path.join(PACKAGE_ROOT, 'scripts', 'install-apply.js');

let currentVersion = null;
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'));
  currentVersion = pkg.version || null;
} catch (_) {}

const trackerPath = path.join(os.homedir(), '.claude', 'vcp', 'installed-vcp-version.txt');
let lastDeployed = null;
try { lastDeployed = fs.readFileSync(trackerPath, 'utf8').trim() || null; } catch (_) {}

if (currentVersion && currentVersion === lastDeployed) {
  process.stdout.write(`\n  [VCP] v${currentVersion} already installed — skipping.\n\n`);
  process.exit(0);
}

process.stdout.write(`\n  [VCP] Running core setup (v${currentVersion || '?'})...\n`);

const result = spawnSync(
  process.execPath,
  [INSTALL_SCRIPT, '--target', 'claude', '--profile', 'core'],
  { encoding: 'utf8', cwd: PACKAGE_ROOT, timeout: 120000, stdio: 'inherit' }
);

if (result.error || result.status !== 0) {
  const reason = result.error ? result.error.message : `exit ${result.status}`;
  process.stdout.write(`\n  [VCP] Auto-setup failed (${reason}).\n  Run manually: npx vcp\n\n`);
} else {
  try {
    fs.mkdirSync(path.dirname(trackerPath), { recursive: true });
    fs.writeFileSync(trackerPath, currentVersion || 'unknown');
  } catch (_) {}
  process.stdout.write(`\n  [VCP] Core setup complete! Run 'npx vcp' for language-specific rules.\n\n`);
}
