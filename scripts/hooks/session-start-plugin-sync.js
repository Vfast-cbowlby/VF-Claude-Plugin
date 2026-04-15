#!/usr/bin/env node
/**
 * session-start-plugin-sync.js
 *
 * Reinstalls VCP plugin artifacts (rules, hooks, agents, commands, skills) when
 * the VF-Claude-Plugin version changes after a `claude plugin update` run.
 *
 * Fast path: version unchanged → passes stdin through and exits in <100ms.
 * Slow path: version changed   → runs install-apply.js, updates tracker, exits.
 *
 * Version tracker: ~/.claude/vcp/installed-vcp-version.txt
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const homeDir = os.homedir();
const installedPluginsPath = path.join(homeDir, '.claude', 'plugins', 'installed_plugins.json');
const versionTrackerPath = path.join(homeDir, '.claude', 'vcp', 'installed-vcp-version.txt');

// Prefer CLAUDE_PLUGIN_ROOT (set by the VCP session-start bootstrap) over fallback
const pluginRoot = (process.env.CLAUDE_PLUGIN_ROOT || '').trim() ||
  path.join(homeDir, '.claude', 'plugins', 'marketplaces', 'VF-Claude-Plugin');
const installScript = path.join(pluginRoot, 'scripts', 'install-apply.js');

// Read stdin — required by the Claude Code hook protocol
let stdinData = '';
try { stdinData = fs.readFileSync(0, 'utf8'); } catch (_) { /* stdin not available — safe to ignore */ }

function passThrough() {
  if (stdinData) process.stdout.write(stdinData);
}

function getInstalledVersion() {
  try {
    const data = JSON.parse(fs.readFileSync(installedPluginsPath, 'utf8'));
    const entries = data.plugins && data.plugins['VF-Claude-Plugin@VF-Claude-Plugin'];
    return (entries && entries[0] && entries[0].version) || null;
  } catch (_) {
    return null;
  }
}

function getLastDeployedVersion() {
  try {
    return fs.readFileSync(versionTrackerPath, 'utf8').trim() || null;
  } catch (_) {
    return null;
  }
}

function writeTrackerVersion(version) {
  try {
    fs.mkdirSync(path.dirname(versionTrackerPath), { recursive: true });
    fs.writeFileSync(versionTrackerPath, version, 'utf8');
  } catch (e) {
    process.stderr.write(`[plugin-sync] WARNING: could not write version tracker: ${e.message}\n`);
  }
}

const currentVersion = getInstalledVersion();
const lastDeployed = getLastDeployedVersion();

// Fast path — nothing to do
if (!currentVersion || currentVersion === lastDeployed) {
  passThrough();
  process.exit(0);
}

process.stderr.write(
  `[plugin-sync] VF-Claude-Plugin updated (${lastDeployed || 'none'} → ${currentVersion}), reinstalling VCP artifacts...\n`
);

if (!fs.existsSync(installScript)) {
  process.stderr.write(`[plugin-sync] WARNING: install script not found at ${installScript} — skipping\n`);
  passThrough();
  process.exit(0);
}

// Ensure npm dependencies are installed before running install-apply.js.
// node_modules may be absent after a fresh plugin update or first install.
const nodeModulesPath = path.join(pluginRoot, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  process.stderr.write(`[plugin-sync] node_modules missing — running npm install...\n`);
  const npmInstall = spawnSync('npm', ['install', '--prefer-offline', '--no-audit', '--no-fund'], {
    encoding: 'utf8',
    env: process.env,
    cwd: pluginRoot,
    timeout: 120000,
    shell: true,
  });
  if (npmInstall.error || npmInstall.status !== 0) {
    const reason = npmInstall.error ? npmInstall.error.message : `exit ${npmInstall.status}`;
    process.stderr.write(`[plugin-sync] ERROR: npm install failed (${reason}) — reinstall skipped\n`);
    if (npmInstall.stderr) process.stderr.write(npmInstall.stderr);
    passThrough();
    process.exit(0);
  }
  process.stderr.write(`[plugin-sync] npm install complete.\n`);
}

const result = spawnSync(process.execPath, ['scripts/install-apply.js', '--target', 'claude', '--profile', 'core'], {
  encoding: 'utf8',
  env: process.env,
  cwd: pluginRoot,
  timeout: 120000,
});

if (result.error || result.status !== 0) {
  const reason = result.error ? result.error.message : `exit ${result.status}`;
  process.stderr.write(`[plugin-sync] ERROR: reinstall failed (${reason})\n`);
  if (result.stderr) process.stderr.write(result.stderr);
} else {
  writeTrackerVersion(currentVersion);
  process.stderr.write(`[plugin-sync] VCP artifacts reinstalled for v${currentVersion}.\n`);
}

passThrough();
process.exit(0);
