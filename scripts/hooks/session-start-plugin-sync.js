#!/usr/bin/env node
/**
 * session-start-plugin-sync.js
 *
 * Installs or reinstalls VCP plugin artifacts when:
 *   - The VF-Claude-Plugin version has changed (upgrade case), OR
 *   - No version was ever tracked AND no rules are installed (fresh install case)
 *
 * Fast path: already up-to-date -> pass stdin through and exit in <100ms.
 * Slow path: install needed -> npm install (if required) + install-apply.js -> exit.
 *
 * Version tracker: ~/.claude/vcp/installed-vcp-version.txt
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const homeDir = os.homedir();
const claudeDir = path.join(homeDir, '.claude');
const installedPluginsPath = path.join(claudeDir, 'plugins', 'installed_plugins.json');
const versionTrackerPath = path.join(claudeDir, 'vcp', 'installed-vcp-version.txt');
const rulesCorePath = path.join(claudeDir, 'rules', 'common');

const PLUGIN_SLUGS = ['vcp', 'VF-Claude-Plugin', 'ecc'];

function resolvePluginRoot() {
  const envRoot = (process.env.CLAUDE_PLUGIN_ROOT || '').trim();
  if (envRoot && fs.existsSync(path.join(envRoot, 'scripts', 'install-apply.js'))) {
    return envRoot;
  }

  for (const slug of PLUGIN_SLUGS) {
    for (const rel of [slug, `${slug}@${slug}`, path.join('marketplace', slug)]) {
      const candidate = path.join(claudeDir, 'plugins', rel);
      if (fs.existsSync(path.join(candidate, 'scripts', 'install-apply.js'))) {
        return candidate;
      }
    }
  }

  try {
    for (const slug of PLUGIN_SLUGS) {
      const cacheBase = path.join(claudeDir, 'plugins', 'cache', slug);
      for (const org of fs.readdirSync(cacheBase, { withFileTypes: true })) {
        if (!org.isDirectory()) continue;
        for (const ver of fs.readdirSync(path.join(cacheBase, org.name), { withFileTypes: true })) {
          if (!ver.isDirectory()) continue;
          const candidate = path.join(cacheBase, org.name, ver.name);
          if (fs.existsSync(path.join(candidate, 'scripts', 'install-apply.js'))) {
            return candidate;
          }
        }
      }
    }
  } catch (_) { /* intentional noop */ }

  return null;
}

let stdinData = '';
try { stdinData = fs.readFileSync(0, 'utf8'); } catch (_) { /* intentional noop */ }

function passThrough() {
  if (stdinData) process.stdout.write(stdinData);
}

function getInstalledVersion() {
  try {
    const data = JSON.parse(fs.readFileSync(installedPluginsPath, 'utf8'));
    const plugins = data.plugins || {};
    for (const key of Object.keys(plugins)) {
      if (PLUGIN_SLUGS.some(s => key.startsWith(s))) {
        const entries = plugins[key];
        const ver = entries && entries[0] && entries[0].version;
        if (ver) return ver;
      }
    }
    return null;
  } catch (_) {
    return null;
  }
}

function getLastDeployedVersion() {
  try { return fs.readFileSync(versionTrackerPath, 'utf8').trim() || null; } catch (_) { return null; }
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
const rulesInstalled = fs.existsSync(rulesCorePath);

// Trigger setup when:
// 1. Version changed (upgrade) -- installed_plugins.json has a newer version
// 2. Fresh install -- no tracker and no rules on disk (covers missing installed_plugins.json)
const needsSetup = (
  (currentVersion !== null && currentVersion !== lastDeployed) ||
  (lastDeployed === null && !rulesInstalled)
);

if (!needsSetup) {
  passThrough();
  process.exit(0);
}

const pluginRoot = resolvePluginRoot();
const installScript = pluginRoot ? path.join(pluginRoot, 'scripts', 'install-apply.js') : null;

if (!installScript || !fs.existsSync(installScript)) {
  process.stderr.write(
    '[plugin-sync] WARNING: could not locate install-apply.js -- ' +
    'set CLAUDE_PLUGIN_ROOT or run: npx vcp\n'
  );
  passThrough();
  process.exit(0);
}

const label = lastDeployed
  ? `updated (${lastDeployed} -> ${currentVersion || '?'})`
  : 'first install';
process.stderr.write(`[plugin-sync] VF-Claude-Plugin ${label} -- running core setup...\n`);

const nodeModulesPath = path.join(pluginRoot, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  process.stderr.write('[plugin-sync] node_modules missing -- running npm install...\n');
  const npmInstall = spawnSync('npm', ['install', '--prefer-offline', '--no-audit', '--no-fund'], {
    encoding: 'utf8',
    env: process.env,
    cwd: pluginRoot,
    timeout: 120000,
    shell: true,
  });
  if (npmInstall.error || npmInstall.status !== 0) {
    const reason = npmInstall.error ? npmInstall.error.message : `exit ${npmInstall.status}`;
    process.stderr.write(`[plugin-sync] ERROR: npm install failed (${reason}) -- run: npx vcp\n`);
    if (npmInstall.stderr) process.stderr.write(npmInstall.stderr);
    passThrough();
    process.exit(0);
  }
  process.stderr.write('[plugin-sync] npm install complete.\n');
}

const result = spawnSync(
  process.execPath,
  ['scripts/install-apply.js', '--target', 'claude', '--profile', 'core'],
  { encoding: 'utf8', env: process.env, cwd: pluginRoot, timeout: 120000 }
);

if (result.error || result.status !== 0) {
  const reason = result.error ? result.error.message : `exit ${result.status}`;
  process.stderr.write(`[plugin-sync] ERROR: setup failed (${reason}) -- run: npx vcp\n`);
  if (result.stderr) process.stderr.write(result.stderr);
} else {
  writeTrackerVersion(currentVersion || 'installed');
  process.stderr.write(
    `[plugin-sync] VCP core setup complete${currentVersion ? ` (v${currentVersion})` : ''}.\n`
  );
}

passThrough();
process.exit(0);
