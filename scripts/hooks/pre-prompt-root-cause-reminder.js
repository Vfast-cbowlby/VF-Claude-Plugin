#!/usr/bin/env node
/**
 * Pre-Prompt Root Cause Reminder Hook
 *
 * Fires on UserPromptSubmit. Scans the user's message for failure indicators
 * (build errors, test failures, exceptions, broken behaviour). When found,
 * writes a reminder to stderr so Claude sees it before composing a response.
 *
 * Advisory only — always exits 0 and passes through the original prompt.
 * Never blocks or modifies the user's message.
 *
 * Why UserPromptSubmit:
 *   The reminder must land BEFORE Claude reads the failure and starts writing
 *   a fix. PreToolUse(Edit) fires too late — Claude has already decided what
 *   to change by then. UserPromptSubmit fires the moment the failure message
 *   is submitted, which is exactly when root cause analysis should begin.
 */

'use strict';

const MAX_STDIN = 1024 * 1024;

/**
 * Failure indicator patterns. Matched case-insensitively against the prompt.
 * Ordered from most specific (stack traces, Maven output) to most general.
 */
const FAILURE_PATTERNS = [
  // Build / CI output
  /BUILD\s+FAIL(URE|ED)/i,
  /Tests\s+run:\s*\d+.*(?:Failures|Errors):\s*[1-9]/i,
  /\[ERROR\]\s+.*(?:Exception|Error|FAILED)/i,
  /##\[error\]/i,
  /exit\s+code\s+[1-9]/i,

  // Stack traces and exceptions
  /(?:Exception|Error):\s+.{10}/,
  /at\s+[\w$.]+\([\w$.]+\.java:\d+\)/,
  /caused\s+by:/i,
  /stack\s+trace/i,

  // Test failure language
  /test(?:s)?\s+(?:fail(?:ed|ing)|broken|regress)/i,
  /failing\s+test/i,
  /\d+\s+(?:test\s+)?fail/i,
  /assertion\s+(?:fail|error)/i,

  // General failure language in context of code/builds
  /(?:build|pipeline|job|stage|step)\s+(?:fail(?:ed|ing)|broken|errored)/i,
  /constraint\s+violation/i,
  /unique\s+constraint/i,
  /foreign\s+key\s+(?:constraint|violation)/i,
  /duplicate\s+key/i,
  /NullPointerException|ClassCastException|IllegalStateException|IllegalArgumentException/,
];

/**
 * Returns true if the prompt contains failure indicators.
 *
 * @param {string} prompt
 * @returns {boolean}
 */
function hasFailureIndicators(prompt) {
  return FAILURE_PATTERNS.some(pattern => pattern.test(prompt));
}

/**
 * Core logic — exported so run-with-flags.js can call directly.
 *
 * @param {string} rawInput - Raw JSON string from stdin
 * @returns {string} The original input (pass-through)
 */
function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const prompt = String(input.prompt || '');

    if (prompt.length > 0 && hasFailureIndicators(prompt)) {
      process.stderr.write([
        '[root-cause-before-fix] Failure indicators detected.',
        '[root-cause-before-fix] Before writing any fix, work through the root cause:',
        '[root-cause-before-fix]   Step 0 — Was this passing before? If yes: what changed? Look there first.',
        '[root-cause-before-fix]   Step 1 — What structural condition makes this failure *possible*?',
        '[root-cause-before-fix]   Step 2 — Find 2-3 similar things that work. What mechanism do they have that this doesn\'t?',
        '[root-cause-before-fix]   Step 3 — State root cause in one sentence before writing a single line of fix.',
        '[root-cause-before-fix] Invoke the root-cause-before-fix skill for the full process.',
        '',
      ].join('\n'));
    }
  } catch {
    // Ignore parse errors — pass through unchanged.
  }

  return rawInput;
}

// ── stdin entry point ──────────────────────────────────────────────────────
if (require.main === module) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    if (raw.length < MAX_STDIN) {
      raw += chunk.substring(0, MAX_STDIN - raw.length);
    }
  });
  process.stdin.on('end', () => {
    process.stdout.write(run(raw));
  });
}

module.exports = { run, hasFailureIndicators };
