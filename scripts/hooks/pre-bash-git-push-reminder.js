#!/usr/bin/env node
'use strict';

const MAX_STDIN = 1024 * 1024;
let raw = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  if (raw.length < MAX_STDIN) {
    const remaining = MAX_STDIN - raw.length;
    raw += chunk.substring(0, remaining);
  }
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw);
    const cmd = String(input.tool_input?.command || '');
    if (/\bgit\s+push\b/.test(cmd)) {
      process.stderr.write('[Hook] PRE-PUSH CHECKLIST:
');
      process.stderr.write('[Hook]   (1) Integration tests changed?  Run them locally first: ./mvnw test -Dtest="*IT" -DfailIfNoTests=false
');
      process.stderr.write('[Hook]   (2) New Docker image added?      Verify the tag resolves: docker pull <registry>/<image>:<tag>
');
      process.stderr.write('[Hook]   (3) Script + fixture added?      Run the script against the fixture before pushing
');
      process.stderr.write('[Hook]   (4) Hotfix to main?              Same rules apply — no untested code on main
');
    }
  } catch {
    // ignore parse errors and pass through
  }

  process.stdout.write(raw);
});
