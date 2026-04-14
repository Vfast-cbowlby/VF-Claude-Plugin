---
name: root-cause-before-fix
description: Use before fixing any bug, test failure, or build error. Forces root cause analysis before writing any code — includes change-driven scope narrowing to avoid chasing symptoms.
origin: ECC
---

# Root Cause Before Fix

**Invoke this skill before writing any fix.** Patching the symptom is fast but
produces cascading failures. This skill costs 5 minutes and saves hours.

## The Rule

**You may not write a fix until you can answer all three questions:**

1. What structural condition makes this failure *possible*?
2. What invariant is *missing* or *broken* at the design level?
3. Does fixing the immediate error address the structural condition, or just mask it?

If you cannot answer all three, you do not understand the problem well enough to fix it.

---

## Process

### Step 0 — Was this working before?

Before any analysis, establish whether this is a **regression** or a **latent defect**.

```
Was this passing in a recent build / commit / release?
├── YES → What changed? (git log, git diff, PR description)
│         └── Start your investigation in the changed area first.
│             Changes are the most probable cause of regressions.
│             Narrow scope before doing structural analysis.
└── NO  → It was never correct. Skip to Step 1.
          (Don't waste time in git history — the bug predates the change.)
```

**Why this matters:** A test that was green yesterday and red today has a bounded
search space — the delta between those two states. Reading the error message and
jumping to a fix skips the fastest path to the root cause.

**Practical example:**
> Build was green on `master`. PR adds `feat(test): re-enable IdpBindingIT`.
> First question: "What did that PR change?" → New test class with no `@BeforeEach`
> cleanup → search for how other test classes handle cleanup → root cause in one step.

### Step 1 — Read the failure structurally

For each failing test/error:
- What is the error? *(surface)*
- What triggered the error? *(proximate cause)*
- **Why was the system in a state where this trigger could produce this error?** *(root cause)*

The root cause is almost always one level deeper than the error message.

### Step 2 — Find the analogous working case

Before touching anything, find 2–3 similar things in the codebase that *don't* have this problem.

- How do they avoid it?
- What mechanism, base class, pattern, or invariant do they rely on?
- Does the failing code have that same mechanism?

If the answer is "no" — that gap **is** the root cause.

### Step 3 — State the root cause explicitly

Write it out in one sentence:

> "This fails because **[class/component]** is missing **[mechanism/invariant]**
> that **[analogous working cases]** rely on to **[guarantee X]**."

If you cannot write this sentence cleanly, go back to Step 2.

### Step 4 — Verify the fix closes the structural gap

The fix must address the root cause statement from Step 3, not just make the
immediate error go away. Ask:

> "If I apply this fix and the same class of error occurs elsewhere, will this
> fix prevent it — or will I be back here patching again?"

If the answer is "patching again" — the fix is a workaround. State that explicitly
and either escalate to a structural fix or document the debt.

---

## Red Flags — Stop and Re-diagnose

These thoughts mean you are fixing a symptom, not a root cause:

| Thought | What it means |
|---|---|
| "Just make the error go away" | You're patching, not fixing |
| "Add a unique suffix to avoid the collision" | You're working around a missing invariant |
| "Add a null check" | Something upstream should never produce null |
| "Catch and swallow this exception" | The exception shouldn't be thrown |
| "Skip this assertion in this test" | The test is exposing a real problem |
| "This only happens sometimes" | You found flakiness — dig deeper |
| "It passed locally, must be CI" | Environment divergence — find the difference |

---

## Applied Example

**Failure:** `uq_tenants_idp` unique constraint violation in `IdpBindingIT`

**Wrong path (symptom fix, skipped Step 0):**
> "The alias collides → make it unique per call with a UUID suffix."
> *(Masks the problem. Next run will find a different constraint violation.)*

**Right path (with Step 0):**

> **Step 0:** Was this passing before? → Yes, before this PR re-enabled `IdpBindingIT`.
> What changed? → New test class added. Investigate the new class first.
>
> **Step 2:** How do other DB-writing tests avoid state leakage?
> → They extend `AbstractDbWriterIT` which has `@BeforeEach frameworkCleanup()`.
>
> **Step 3:** Root cause:
> *"IdpBindingIT is missing the `@BeforeEach` cleanup that every other
> DB-writing test class gets from `AbstractDbWriterIT`, because it
> extends `AbstractKeycloakIntegrationTest` instead and Java has no
> multiple inheritance."*
>
> **Step 4:** Fix: wire `TestDataCleaner.clean()` into a `@BeforeEach` in
> `IdpBindingIT` directly. The unique-alias workaround is unnecessary — revert it.

Total: one correct fix instead of two cascading patches across two CI runs.
