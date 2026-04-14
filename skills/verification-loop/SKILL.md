---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
origin: ECC+superpowers
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent completed | VCS diff shows changes | Agent reports "success" |
| Requirements met | Line-by-line checklist | Tests passing |

## Red Flags — STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!", etc.)
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification
- Thinking "just this once"
- Tired and wanting work over
- **ANY wording implying success without having run verification**

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence ≠ evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter ≠ compiler |
| "Agent said success" | Verify independently |
| "I'm tired" | Exhaustion ≠ excuse |
| "Partial check is enough" | Partial proves nothing |
| "Different words so rule doesn't apply" | Spirit over letter |

## Key Patterns

**Tests:**
```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**Regression tests (TDD Red-Green):**
```
✅ Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass)
❌ "I've written a regression test" (without red-green verification)
```

**Build:**
```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed" (linter doesn't check compilation)
```

**Requirements:**
```
✅ Re-read plan → Create checklist → Verify each → Report gaps or completion
❌ "Tests pass, phase complete"
```

**Agent delegation:**
```
✅ Agent reports success → Check VCS diff → Verify changes → Report actual state
❌ Trust agent report
```

---

## Pre-PR Verification Checklist

Before committing or creating a PR, run ALL phases in order. Stop and fix on any failure.

### Phase 1: Build

```bash
# JS/TS
npm run build 2>&1 | tail -20

# Java/Spring Boot
./mvnw package -DskipTests -q
```

If build fails, STOP and fix before continuing.

### Phase 2: Type Check

```bash
# TypeScript
npx tsc --noEmit 2>&1 | head -30

# Python
pyright . 2>&1 | head -30
```

Report all type errors. Fix critical ones before continuing.

### Phase 3: Lint

```bash
# JS/TS
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30

# Java (Checkstyle runs in Maven verify)
./mvnw checkstyle:check -q
```

### Phase 4: Tests with Coverage

```bash
# JS/TS — target 80%+ coverage
npm test -- --coverage 2>&1 | tail -50

# Java/Spring Boot
./mvnw test -pl <module> jacoco:report
```

Report: Total tests / Passed / Failed / Coverage %.

### Phase 5: Security Scan

```bash
# Check for committed secrets or console.log
grep -rn "console\.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
grep -rn "api_key\|secret\|password" --include="*.ts" --include="*.yml" . 2>/dev/null | grep -v ".example" | head -10
```

### Phase 6: Diff Review

```bash
git diff --stat
git diff HEAD~1 --name-only
```

Review each changed file: unintended changes, missing error handling, edge cases.

### Verification Report Format

```
VERIFICATION REPORT
===================
Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL]
Diff:      [X files changed]

Overall:   [READY / NOT READY] for PR
Issues: ...
```

---

## Continuous Mode

For long sessions, run verification after every major change — not just at PR time.

```
Mental checkpoints:
- After completing each function or method
- After finishing a component or class
- Before moving to the next task

Run: /verify
```

This complements PostToolUse hooks: hooks catch issues immediately; this skill provides comprehensive review.

---

## Why This Matters

Verification failures lead to:
- Broken trust ("I don't believe you")
- Undefined functions shipped that would crash in production
- Missing requirements shipped as complete features
- Time wasted on false completion → redirect → rework

**No shortcuts for verification. Run the command. Read the output. THEN claim the result.**
