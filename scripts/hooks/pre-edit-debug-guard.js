#!/usr/bin/env node
/**
 * Pre-Edit Debug Instrumentation Guard
 *
 * Fires on PreToolUse for Edit|Write|MultiEdit.
 *
 * What: Detects when Claude is about to add debug instrumentation (System.err.println,
 * console.log, ad-hoc print statements) to source files and BLOCKS the edit with
 * exit code 2.
 *
 * Why this is a hard block (exit 2), not a warning (exit 0):
 *   Advisory hooks are visible but ignorable. The root-cause-before-fix skill
 *   was already loaded and present, yet was rationalized past. A hard block at
 *   the tool boundary is the only reliable enforcement.
 *
 * Why adding debug instrumentation is the wrong move:
 *   Debug output tells you WHAT is happening at a specific execution point.
 *   It does not answer WHY the system is in a state where this can happen.
 *   The root-cause-before-fix skill answers that question in < 5 minutes using
 *   structural analysis — without touching the codebase at all.
 *
 * Failure mode this prevents:
 *   1. A test or flow fails with an opaque error
 *   2. Debug print statements are added to trace execution step-by-step
 *   3. Multiple CI runs and hours pass diagnosing symptoms through output
 *   4. Root cause was findable in minutes by reading structural conditions —
 *      no instrumentation required
 *
 * What to do instead (when this hook fires):
 *   1. Invoke the root-cause-before-fix skill
 *   2. Step 0: Was this passing before? If yes — what changed? Start there.
 *   3. Step 3: State the root cause in one sentence
 *   4. Only then write the minimal change that closes the structural gap
 */

'use strict';

const path = require('path');

// Source file extensions — only guard these; skip config/yaml/json/md/sh
const SOURCE_EXTENSIONS = new Set([
  '.java', '.kt', '.scala', '.groovy',
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.rb',
  '.go', '.rs', '.cpp', '.c', '.h', '.cs',
]);

/**
 * Patterns that indicate debug instrumentation being added.
 * Intentionally specific to avoid false positives on legitimate code.
 *
 * Key signals:
 *  - System.err.println  — almost never legitimate in production/test code
 *  - System.out.println with debug keywords — ad-hoc tracing
 *  - console.log/error/warn/debug — ad-hoc browser/Node tracing
 *  - fmt.Println / print() with debug keywords — Go/Python ad-hoc tracing
 *  - Inline [DEBUG] / // DEBUG comments — explicit debug markers
 */
const DEBUG_PATTERNS = [
  // Java — System.err is almost never legitimate outside of CLIs
  /System\.err\.print(?:ln)?\s*\(/,
  // Java — System.out with obvious debug context keywords
  /System\.out\.print(?:ln)?\s*\(.*(?:[Dd]ebug|[Hh]op\s*\d|[Ss]tatus=|[Cc]ookie:|[Rr]edirect|[Ll]ocation=|[Ss]et-[Cc]ookie)/,
  // JavaScript / TypeScript — console.log is never correct in source files
  /console\.(log|error|warn|debug|trace)\s*\(/,
  // Python — print with debug context
  /\bprint\s*\(.*(?:debug|hop|status|cookie|redirect)/i,
  // Go — fmt.Println with debug context
  /fmt\.Print(?:ln|f)?\s*\(.*(?:debug|hop|status|cookie|redirect)/i,
  // Explicit debug markers anyone might add
  /\/\/\s*DEBUG\b/,
  /\/\*\s*DEBUG\b/,
  /\bDEBUG_LOG\s*\(/,
];

function isSourceFile(filePath) {
  if (!filePath) return false;
  const ext = path.extname(filePath).toLowerCase();
  return SOURCE_EXTENSIONS.has(ext);
}

function hasDebugInstrumentation(content) {
  if (!content) return false;
  return DEBUG_PATTERNS.some(pattern => pattern.test(content));
}

/**
 * Core logic — exported so run-with-flags.js can call it in-process.
 *
 * Returns a string (pass-through) or { exitCode, stderr, stdout } object.
 */
function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const toolName = String(input.tool_name || '');
    const toolInput = input.tool_input || {};

    const filePath = String(toolInput.file_path || '');
    if (!isSourceFile(filePath)) {
      return rawInput; // not a source file — pass through
    }

    // Extract the content being written/inserted
    let newContent = '';
    if (toolName === 'Write') {
      newContent = String(toolInput.content || '');
    } else if (toolName === 'Edit') {
      newContent = String(toolInput.new_string || '');
    } else if (toolName === 'MultiEdit') {
      const edits = Array.isArray(toolInput.edits) ? toolInput.edits : [];
      newContent = edits.map(e => String(e.new_string || '')).join('\n');
    } else {
      return rawInput; // unknown tool — pass through
    }

    if (hasDebugInstrumentation(newContent)) {
      return {
        exitCode: 2,
        stdout: '',
        stderr: [
          '',
          'BLOCKED — You are about to add debug instrumentation to a source file.',
          '',
          'Debug output tells you WHAT is happening at one execution point.',
          'It does not tell you WHY the system is in a state where this can happen.',
          'Root cause analysis answers that question faster — without touching the codebase.',
          '',
          'Required steps BEFORE making any code change:',
          '  1. Invoke: root-cause-before-fix skill',
          '  2. Step 0: Was this passing before? If yes — what changed? Start there.',
          '  3. Step 2: Find 2-3 similar things that work. What mechanism are they using?',
          '  4. Step 3: State the root cause in one sentence.',
          '  5. Only then write the minimal change that closes the structural gap.',
          '',
          'Reminder: Verbose instrumentation tells you what happened at one point.',
          'Structural analysis answers why the system is in a broken state —',
          'and typically takes 5 minutes without modifying any code.',
          '',
        ].join('\n'),
      };
    }
  } catch {
    // Parse error — pass through unchanged
  }

  return rawInput;
}

// ── stdin entry point ────────────────────────────────────────────────────────
if (require.main === module) {
  const MAX_STDIN = 1024 * 1024;
  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    if (data.length < MAX_STDIN) {
      data += chunk.substring(0, MAX_STDIN - data.length);
    }
  });
  process.stdin.on('end', () => {
    const result = run(data);
    if (result && typeof result === 'object' && result.exitCode) {
      if (result.stderr) process.stderr.write(result.stderr);
      process.exit(result.exitCode);
    }
    process.stdout.write(typeof result === 'string' ? result : data);
  });
}

module.exports = { run, hasDebugInstrumentation, isSourceFile };
