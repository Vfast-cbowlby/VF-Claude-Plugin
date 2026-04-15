# VF Claude Plugin

> **Forked from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) — maintained by [Vfast-cbowlby](https://github.com/Vfast-cbowlby/VF-Claude-Plugin)**
>
> This plugin is specific to Verifast's SDLC, artifacts, and engineering practices. The upstream public repo is monitored weekly and beneficial enhancements are adopted on an ongoing basis. Over time, this plugin will evolve through continuous improvement contributions from across Verifast's product engineering teams.
>
> **All Verifast team members are welcome to contribute PRs.** Include a reason for the change; PRs that demonstrably improve performance will be approved.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white)
![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white)
![Java](https://img.shields.io/badge/-Java-ED8B00?logo=openjdk&logoColor=white)
![Perl](https://img.shields.io/badge/-Perl-39457E?logo=perl&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

**The performance optimization system for AI agent harnesses.**

Not just configs. A complete system: skills, instincts, memory optimization, continuous learning, security scanning, and research-first development. Production-ready agents, skills, hooks, rules, MCP configurations, and legacy command shims evolved over 10+ months of intensive daily use building real products.

Works across **Claude Code**, **Codex**, **Cursor**, **OpenCode**, **Gemini**, and other AI agent harnesses.

---

## Guides

The in-repo guides cover each major topic in depth:

- [`the-shortform-guide.md`](the-shortform-guide.md) — Setup, foundations, philosophy. **Read this first.**
- [`the-longform-guide.md`](the-longform-guide.md) — Token optimization, memory persistence, evals, parallelization.
- [`the-security-guide.md`](the-security-guide.md) — Attack vectors, sandboxing, sanitization, security patterns.

| Topic | What You'll Learn |
|-------|-------------------|
| Token Optimization | Model selection, system prompt slimming, background processes |
| Memory Persistence | Hooks that save/load context across sessions automatically |
| Continuous Learning | Auto-extract patterns from sessions into reusable skills |
| Verification Loops | Checkpoint vs continuous evals, grader types, pass@k metrics |
| Parallelization | Git worktrees, cascade method, when to scale instances |
| Subagent Orchestration | The context problem, iterative retrieval pattern |

---

## Quick Start

Get up and running in under 2 minutes:

### Step 1: Install the Plugin

> NOTE: The plugin is convenient, but the OSS installer below is still the most reliable path if your Claude Code build has trouble resolving self-hosted marketplace entries.

```bash
# Add marketplace
/plugin marketplace add https://github.com/Vfast-cbowlby/VF-Claude-Plugin

# Install plugin
/plugin install VF-Claude-Plugin@VF-Claude-Plugin
```

### Step 2: Install Rules and Hooks

Rules and hook scripts are now **automatically kept in sync** by the `session-start-plugin-sync.js` hook included in this plugin. On every session start, the hook checks whether the installed plugin version has changed and, if so, re-runs `install-apply.js` to reinstall all ECC artifacts (rules, hooks, skills) into `~/.claude/` automatically.

For your first install, or to install manually at any time:

```bash
# Clone the repo first
git clone https://github.com/Vfast-cbowlby/VF-Claude-Plugin.git
cd VF-Claude-Plugin

# Install dependencies (pick your package manager)
npm install        # or: pnpm install | yarn install | bun install

# macOS/Linux

# Recommended: install everything (full profile)
./install.sh --profile full

# Or install for specific languages only
./install.sh typescript    # or python or golang or swift or php
# ./install.sh typescript python golang swift php
# ./install.sh --target cursor typescript
# ./install.sh --target antigravity typescript
# ./install.sh --target gemini --profile full
```

```powershell
# Windows PowerShell

# Recommended: install everything (full profile)
.\install.ps1 --profile full

# Or install for specific languages only
.\install.ps1 typescript   # or python or golang or swift or php
# .\install.ps1 typescript python golang swift php
# .\install.ps1 --target cursor typescript
# .\install.ps1 --target antigravity typescript
# .\install.ps1 --target gemini --profile full

# npm-installed compatibility entrypoint also works cross-platform
npx vcp-install typescript
```

For manual install instructions see the README in the `rules/` folder. When copying rules manually, copy the whole language directory (for example `rules/common` or `rules/golang`), not the files inside it, so relative references keep working and filenames do not collide.

### Step 3: Start Using

```bash
# Skills are the primary workflow surface.
# Existing slash-style command names still work while ECC migrates off commands/.

# Plugin install uses the namespaced form
/ecc:plan "Add user authentication"

# Manual install keeps the shorter slash form:
# /plan "Add user authentication"

# Check available commands
/plugin list VF-Claude-Plugin@VF-Claude-Plugin
```

**That's it!** You now have access to 47 agents, 193 skills, and 79 legacy command shims.

### Multi-model commands require additional setup

> WARNING: `multi-*` commands are **not** covered by the base plugin/rules install above.
>
> To use `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend`, and `/multi-workflow`, you must also install the `ccg-workflow` runtime.
>
> Initialize it with `npx ccg-workflow`.
>
> That runtime provides the external dependencies these commands expect, including:
> - `~/.claude/bin/codeagent-wrapper`
> - `~/.claude/.ccg/prompts/*`
>
> Without `ccg-workflow`, these `multi-*` commands will not run correctly.

---

## Cross-Platform Support

This plugin now fully supports **Windows, macOS, and Linux**, alongside tight integration across major IDEs (Cursor, OpenCode, Antigravity) and CLI harnesses. All hooks and scripts have been rewritten in Node.js for maximum compatibility.

### Package Manager Detection

The plugin automatically detects your preferred package manager (npm, pnpm, yarn, or bun) with the following priority:

1. **Environment variable**: `CLAUDE_PACKAGE_MANAGER`
2. **Project config**: `.claude/package-manager.json`
3. **package.json**: `packageManager` field
4. **Lock file**: Detection from package-lock.json, yarn.lock, pnpm-lock.yaml, or bun.lockb
5. **Global config**: `~/.claude/package-manager.json`
6. **Fallback**: First available package manager

To set your preferred package manager:

```bash
# Via environment variable
export CLAUDE_PACKAGE_MANAGER=pnpm

# Via global config
node scripts/setup-package-manager.js --global pnpm

# Via project config
node scripts/setup-package-manager.js --project bun

# Detect current setting
node scripts/setup-package-manager.js --detect
```

Or use the `/setup-pm` command in Claude Code.

### Hook Runtime Controls

Use runtime flags to tune strictness or disable specific hooks temporarily:

```bash
# Hook strictness profile (default: standard)
export ECC_HOOK_PROFILE=standard

# Comma-separated hook IDs to disable
export ECC_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck"
```

---

## What's Inside

This repo is a **Claude Code plugin** - install it directly or copy components manually.

```
VF-Claude-Plugin/
|-- .claude-plugin/   # Plugin and marketplace manifests
|   |-- plugin.json         # Plugin metadata and component paths
|   |-- marketplace.json    # Marketplace catalog for /plugin marketplace add
|
|-- agents/           # 36 specialized subagents for delegation
|   |-- planner.md           # Feature implementation planning
|   |-- architect.md         # System design decisions
|   |-- tdd-guide.md         # Test-driven development
|   |-- code-reviewer.md     # Quality and security review
|   |-- security-reviewer.md # Vulnerability analysis
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2E testing
|   |-- refactor-cleaner.md  # Dead code cleanup
|   |-- doc-updater.md       # Documentation sync
|   |-- docs-lookup.md       # Documentation/API lookup
|   |-- chief-of-staff.md    # Communication triage and drafts
|   |-- loop-operator.md     # Autonomous loop execution
|   |-- harness-optimizer.md # Harness config tuning
|   |-- cpp-reviewer.md      # C++ code review
|   |-- cpp-build-resolver.md # C++ build error resolution
|   |-- go-reviewer.md       # Go code review
|   |-- go-build-resolver.md # Go build error resolution
|   |-- python-reviewer.md   # Python code review
|   |-- database-reviewer.md # Database/Supabase review
|   |-- typescript-reviewer.md # TypeScript/JavaScript code review
|   |-- java-reviewer.md     # Java/Spring Boot code review
|   |-- java-build-resolver.md # Java/Maven/Gradle build errors
|   |-- kotlin-reviewer.md   # Kotlin/Android/KMP code review
|   |-- kotlin-build-resolver.md # Kotlin/Gradle build errors
|   |-- rust-reviewer.md     # Rust code review
|   |-- rust-build-resolver.md # Rust build error resolution
|   |-- pytorch-build-resolver.md # PyTorch/CUDA training errors
|
|-- skills/           # Workflow definitions and domain knowledge
|   |-- coding-standards/           # Language best practices
|   |-- clickhouse-io/              # ClickHouse analytics, queries, data engineering
|   |-- backend-patterns/           # API, database, caching patterns
|   |-- frontend-patterns/          # React, Next.js patterns
|   |-- frontend-slides/            # HTML slide decks and PPTX-to-web presentation workflows (NEW)
|   |-- article-writing/            # Long-form writing in a supplied voice without generic AI tone (NEW)
|   |-- content-engine/             # Multi-platform social content and repurposing workflows (NEW)
|   |-- market-research/            # Source-attributed market, competitor, and investor research (NEW)
|   |-- investor-materials/         # Pitch decks, one-pagers, memos, and financial models (NEW)
|   |-- investor-outreach/          # Personalized fundraising outreach and follow-up (NEW)
|   |-- continuous-learning/        # Auto-extract patterns from sessions (Longform Guide)
|   |-- continuous-learning-v2/     # Instinct-based learning with confidence scoring
|   |-- iterative-retrieval/        # Progressive context refinement for subagents
|   |-- strategic-compact/          # Manual compaction suggestions (Longform Guide)
|   |-- tdd-workflow/               # TDD methodology
|   |-- security-review/            # Security checklist
|   |-- eval-harness/               # Verification loop evaluation (Longform Guide)
|   |-- verification-loop/          # Continuous verification (Longform Guide)
|   |-- videodb/                   # Video and audio: ingest, search, edit, generate, stream (NEW)
|   |-- golang-patterns/            # Go idioms and best practices
|   |-- golang-testing/             # Go testing patterns, TDD, benchmarks
|   |-- cpp-coding-standards/         # C++ coding standards from C++ Core Guidelines (NEW)
|   |-- cpp-testing/                # C++ testing with GoogleTest, CMake/CTest (NEW)
|   |-- django-patterns/            # Django patterns, models, views (NEW)
|   |-- django-security/            # Django security best practices (NEW)
|   |-- django-tdd/                 # Django TDD workflow (NEW)
|   |-- django-verification/        # Django verification loops (NEW)
|   |-- laravel-patterns/           # Laravel architecture patterns (NEW)
|   |-- laravel-security/           # Laravel security best practices (NEW)
|   |-- laravel-tdd/                # Laravel TDD workflow (NEW)
|   |-- laravel-verification/       # Laravel verification loops (NEW)
|   |-- python-patterns/            # Python idioms and best practices (NEW)
|   |-- python-testing/             # Python testing with pytest (NEW)
|   |-- springboot-patterns/        # Java Spring Boot patterns (NEW)
|   |-- springboot-security/        # Spring Boot security (NEW)
|   |-- springboot-tdd/             # Spring Boot TDD (NEW)
|   |-- springboot-verification/    # Spring Boot verification (NEW)
|   |-- configure-ecc/              # Interactive installation wizard (NEW)
|   |-- security-scan/              # AgentShield security auditor integration (NEW)
|   |-- java-coding-standards/     # Java coding standards (NEW)
|   |-- jpa-patterns/              # JPA/Hibernate patterns (NEW)
|   |-- postgres-patterns/         # PostgreSQL optimization patterns (NEW)
|   |-- nutrient-document-processing/ # Document processing with Nutrient API (NEW)
|   |-- docs/examples/project-guidelines-template.md  # Template for project-specific skills
|   |-- database-migrations/         # Migration patterns (Prisma, Drizzle, Django, Go) (NEW)
|   |-- api-design/                  # REST API design, pagination, error responses (NEW)
|   |-- deployment-patterns/         # CI/CD, Docker, health checks, rollbacks (NEW)
|   |-- docker-patterns/            # Docker Compose, networking, volumes, container security (NEW)
|   |-- e2e-testing/                 # Playwright E2E patterns and Page Object Model (NEW)
|   |-- content-hash-cache-pattern/  # SHA-256 content hash caching for file processing (NEW)
|   |-- cost-aware-llm-pipeline/     # LLM cost optimization, model routing, budget tracking (NEW)
|   |-- regex-vs-llm-structured-text/ # Decision framework: regex vs LLM for text parsing (NEW)
|   |-- swift-actor-persistence/     # Thread-safe Swift data persistence with actors (NEW)
|   |-- swift-protocol-di-testing/   # Protocol-based DI for testable Swift code (NEW)
|   |-- search-first/               # Research-before-coding workflow (NEW)
|   |-- skill-stocktake/            # Audit skills and commands for quality (NEW)
|   |-- liquid-glass-design/         # iOS 26 Liquid Glass design system (NEW)
|   |-- foundation-models-on-device/ # Apple on-device LLM with FoundationModels (NEW)
|   |-- swift-concurrency-6-2/       # Swift 6.2 Approachable Concurrency (NEW)
|   |-- perl-patterns/             # Modern Perl 5.36+ idioms and best practices (NEW)
|   |-- perl-security/             # Perl security patterns, taint mode, safe I/O (NEW)
|   |-- perl-testing/              # Perl TDD with Test2::V0, prove, Devel::Cover (NEW)
|   |-- autonomous-loops/           # Autonomous loop patterns: sequential pipelines, PR loops, DAG orchestration (NEW)
|   |-- plankton-code-quality/      # Write-time code quality enforcement with Plankton hooks (NEW)
|   |-- brainstorming/              # Structured brainstorming with visual companion and spec review
|   |-- executing-plans/            # Plan execution workflow and checkpoints
|   |-- subagent-driven-development/ # Orchestrating implementation via subagents with quality review
|   |-- systematic-debugging/       # Root-cause tracing, condition-based waiting, test-pressure patterns
|   |-- writing-plans/              # Plan document authoring and review process
|   |-- writing-skills/             # Skill authoring best practices and graphviz conventions
|   |-- dispatching-parallel-agents/ # When and how to parallelize work across subagents
|   |-- finishing-a-development-branch/ # Branch completion: merge/PR/keep/discard decision + worktree cleanup
|   |-- receiving-code-review/      # Evaluating and implementing code review feedback
|   |-- requesting-code-review/     # Dispatching code-reviewer subagent with precise context
|   |-- using-git-worktrees/        # Full git worktree lifecycle: setup, baseline tests, cleanup
|   |-- root-cause-before-fix/      # Mandatory root-cause analysis before any code modification
|
|-- commands/         # Legacy slash-entry shims; prefer skills/
|   |-- tdd.md              # /tdd - Test-driven development
|   |-- plan.md             # /plan - Implementation planning
|   |-- e2e.md              # /e2e - E2E test generation
|   |-- code-review.md      # /code-review - Quality review
|   |-- build-fix.md        # /build-fix - Fix build errors
|   |-- refactor-clean.md   # /refactor-clean - Dead code removal
|   |-- learn.md            # /learn - Extract patterns mid-session (Longform Guide)
|   |-- learn-eval.md       # /learn-eval - Extract, evaluate, and save patterns (NEW)
|   |-- checkpoint.md       # /checkpoint - Save verification state (Longform Guide)
|   |-- verify.md           # /verify - Run verification loop (Longform Guide)
|   |-- setup-pm.md         # /setup-pm - Configure package manager
|   |-- go-review.md        # /go-review - Go code review (NEW)
|   |-- go-test.md          # /go-test - Go TDD workflow (NEW)
|   |-- go-build.md         # /go-build - Fix Go build errors (NEW)
|   |-- skill-create.md     # /skill-create - Generate skills from git history (NEW)
|   |-- instinct-status.md  # /instinct-status - View learned instincts (NEW)
|   |-- instinct-import.md  # /instinct-import - Import instincts (NEW)
|   |-- instinct-export.md  # /instinct-export - Export instincts (NEW)
|   |-- evolve.md           # /evolve - Cluster instincts into skills
|   |-- prune.md            # /prune - Delete expired pending instincts (NEW)
|   |-- pm2.md              # /pm2 - PM2 service lifecycle management (NEW)
|   |-- multi-plan.md       # /multi-plan - Multi-agent task decomposition (NEW)
|   |-- multi-execute.md    # /multi-execute - Orchestrated multi-agent workflows (NEW)
|   |-- multi-backend.md    # /multi-backend - Backend multi-service orchestration (NEW)
|   |-- multi-frontend.md   # /multi-frontend - Frontend multi-service orchestration (NEW)
|   |-- multi-workflow.md   # /multi-workflow - General multi-service workflows (NEW)
|   |-- orchestrate.md      # /orchestrate - Multi-agent coordination
|   |-- sessions.md         # /sessions - Session history management
|   |-- eval.md             # /eval - Evaluate against criteria
|   |-- test-coverage.md    # /test-coverage - Test coverage analysis
|   |-- update-docs.md      # /update-docs - Update documentation
|   |-- update-codemaps.md  # /update-codemaps - Update codemaps
|   |-- python-review.md    # /python-review - Python code review (NEW)
|
|-- rules/            # Always-follow guidelines (copy to ~/.claude/rules/)
|   |-- README.md            # Structure overview and installation guide
|   |-- common/              # Language-agnostic principles
|   |   |-- coding-style.md    # Immutability, file organization
|   |   |-- git-workflow.md    # Commit format, PR process
|   |   |-- testing.md         # TDD, 80% coverage requirement
|   |   |-- performance.md     # Model selection, context management
|   |   |-- patterns.md        # Design patterns, skeleton projects
|   |   |-- hooks.md           # Hook architecture, TodoWrite
|   |   |-- agents.md          # When to delegate to subagents
|   |   |-- security.md        # Mandatory security checks
|   |-- typescript/          # TypeScript/JavaScript specific
|   |-- python/              # Python specific
|   |-- golang/              # Go specific
|   |-- swift/               # Swift specific
|   |-- php/                 # PHP specific (NEW)
|
|-- hooks/            # Trigger-based automations
|   |-- README.md                 # Hook documentation, recipes, and customization guide
|   |-- hooks.json                # All hooks config (PreToolUse, PostToolUse, Stop, etc.)
|   |-- memory-persistence/       # Session lifecycle hooks (Longform Guide)
|   |-- strategic-compact/        # Compaction suggestions (Longform Guide)
|
|-- scripts/          # Cross-platform Node.js scripts (NEW)
|   |-- lib/                     # Shared utilities
|   |   |-- utils.js             # Cross-platform file/path/system utilities
|   |   |-- package-manager.js   # Package manager detection and selection
|   |-- hooks/                   # Hook implementations
|   |   |-- session-start.js              # Load context on session start
|   |   |-- session-end.js                # Save state on session end
|   |   |-- pre-compact.js                # Pre-compaction state saving
|   |   |-- suggest-compact.js            # Strategic compaction suggestions
|   |   |-- evaluate-session.js           # Extract patterns from sessions
|   |   |-- session-start-plugin-sync.js  # Auto-reinstall ECC artifacts when plugin version changes
|   |   |-- pre-edit-debug-guard.js       # Hard-block on adding debug instrumentation to source files
|   |   |-- pre-prompt-root-cause-reminder.js # Remind to invoke root-cause-before-fix on failure signals
|   |   |-- pre-bash-git-push-reminder.js # Pre-push checklist: ITs, Docker images, script+fixture, hotfixes
|   |-- setup-package-manager.js # Interactive PM setup
|
|-- tests/            # Test suite (NEW)
|   |-- lib/                     # Library tests
|   |-- hooks/                   # Hook tests
|   |-- run-all.js               # Run all tests
|
|-- contexts/         # Dynamic system prompt injection contexts (Longform Guide)
|   |-- dev.md              # Development mode context
|   |-- review.md           # Code review mode context
|   |-- research.md         # Research/exploration mode context
|
|-- examples/         # Example configurations and sessions
|   |-- CLAUDE.md             # Example project-level config
|   |-- user-CLAUDE.md        # Example user-level config
|   |-- saas-nextjs-CLAUDE.md   # Real-world SaaS (Next.js + Supabase + Stripe)
|   |-- go-microservice-CLAUDE.md # Real-world Go microservice (gRPC + PostgreSQL)
|   |-- django-api-CLAUDE.md      # Real-world Django REST API (DRF + Celery)
|   |-- laravel-api-CLAUDE.md     # Real-world Laravel API (PostgreSQL + Redis) (NEW)
|   |-- rust-api-CLAUDE.md        # Real-world Rust API (Axum + SQLx + PostgreSQL) (NEW)
|
|-- mcp-configs/      # MCP server configurations
|   |-- mcp-servers.json    # GitHub, Supabase, Vercel, Railway, etc.
|
|-- marketplace.json  # Self-hosted marketplace config (for /plugin marketplace add)
```

---

## Ecosystem Tools

### Skill Creator

Two ways to generate Claude Code skills from your repository:

#### Option A: Local Analysis (Built-in)

Use the `/skill-create` command for local analysis without external services:

```bash
/skill-create                    # Analyze current repo
/skill-create --instincts        # Also generate instincts for continuous-learning
```

This analyzes your git history locally and generates SKILL.md files.

The local analysis creates:
- **SKILL.md files** - Ready-to-use skills for Claude Code
- **Instinct collections** - For continuous-learning-v2
- **Pattern extraction** - Learns from your commit history

### Continuous Learning v2

The instinct-based learning system automatically learns your patterns:

```bash
/instinct-status        # Show learned instincts with confidence
/instinct-import <file> # Import instincts from others
/instinct-export        # Export your instincts for sharing
/evolve                 # Cluster related instincts into skills
```

See `skills/continuous-learning-v2/` for full documentation.

---

## Requirements

### Claude Code CLI Version

**Minimum version: v2.1.0 or later**

This plugin requires Claude Code CLI v2.1.0+ due to changes in how the plugin system handles hooks.

Check your version:
```bash
claude --version
```

### Important: Hooks Auto-Loading Behavior

> WARNING: **For Contributors:** Do NOT add a `"hooks"` field to `.claude-plugin/plugin.json`. This is enforced by a regression test.

Claude Code v2.1+ **automatically loads** `hooks/hooks.json` from any installed plugin by convention. Explicitly declaring it in `plugin.json` causes a duplicate detection error:

```
Duplicate hooks file detected: ./hooks/hooks.json resolves to already-loaded file
```

---

## Installation

### Install as Plugin 

The easiest way to use this repo - install as a Claude Code plugin:

```bash
# Add this repo as a marketplace
/plugin marketplace add https://github.com/Vfast-cbowlby/VF-Claude-Plugin

# Install the plugin
/plugin install VF-Claude-Plugin@VF-Claude-Plugin
```

Or add directly to your `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "VF-Claude-Plugin": {
      "source": {
        "source": "github",
        "repo": "Vfast-cbowlby/VF-Claude-Plugin"
      }
    }
  },
  "enabledPlugins": {
    "VF-Claude-Plugin@VF-Claude-Plugin": true
  }
}
```

This gives you instant access to all commands, agents, skills, and hooks.

> **Note:** Rules, hooks, and skills are automatically reinstalled on every session start by the `session-start-plugin-sync.js` hook (included in this plugin). If you prefer to install manually or on first setup:
>
> ```bash
> # Clone the repo first
> git clone https://github.com/Vfast-cbowlby/VF-Claude-Plugin.git
>
> # Option A: Automated install (recommended — installs rules, hooks, skills, and agents)
> cd VF-Claude-Plugin
> npm install
> node scripts/install-apply.js --target claude --profile core
>
> # Option B: Manual rules install — user-level (applies to all projects)
> mkdir -p ~/.claude/rules
> cp -r VF-Claude-Plugin/rules/common ~/.claude/rules/
> cp -r VF-Claude-Plugin/rules/typescript ~/.claude/rules/   # pick your stack
> cp -r VF-Claude-Plugin/rules/python ~/.claude/rules/
> cp -r VF-Claude-Plugin/rules/golang ~/.claude/rules/
> cp -r VF-Claude-Plugin/rules/php ~/.claude/rules/
>
> # Option C: Manual rules install — project-level (applies to current project only)
> mkdir -p .claude/rules
> cp -r VF-Claude-Plugin/rules/common .claude/rules/
> cp -r VF-Claude-Plugin/rules/typescript .claude/rules/     # pick your stack
> ```

---
```

#### Hooks

Hooks are automatically registered when you install via plugin. The `session-start-plugin-sync.js` hook ensures they stay up to date as new plugin versions are released.

To add hooks manually, copy the entries from `hooks/hooks.json` into your `~/.claude/settings.json`.

#### Configure MCPs

Copy desired MCP server definitions from `mcp-configs/mcp-servers.json` into your official Claude Code config in `~/.claude/settings.json`, or into a project-scoped `.mcp.json` if you want repo-local MCP access.

If you already run your own copies of ECC-bundled MCPs, set:

```bash
export ECC_DISABLED_MCPS="github,context7,exa,playwright,sequential-thinking,memory"
```

ECC-managed install and Codex sync flows will skip or remove those bundled servers instead of re-adding duplicates.

**Important:** Replace `YOUR_*_HERE` placeholders with your actual API keys.

---

## Key Concepts

### Agents

Subagents handle delegated tasks with limited scope. Example:

```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and maintainability
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

You are a senior code reviewer...
```

### Skills

Skills are the primary workflow surface. They can be invoked directly, suggested automatically, and reused by agents. ECC still ships `commands/` during migration, but new workflow development should land in `skills/` first.

```markdown
# TDD Workflow

1. Define interfaces first
2. Write failing tests (RED)
3. Implement minimal code (GREEN)
4. Refactor (IMPROVE)
5. Verify 80%+ coverage
```

### Hooks

Hooks fire on tool events. Example - warn about console.log:

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] Remove console.log' >&2"
  }]
}
```

### Rules

Rules are always-follow guidelines, organized into `common/` (language-agnostic) + language-specific directories:

```
rules/
  common/          # Universal principles (always install)
  typescript/      # TS/JS specific patterns and tools
  python/          # Python specific patterns and tools
  golang/          # Go specific patterns and tools
  swift/           # Swift specific patterns and tools
  php/             # PHP specific patterns and tools
```

See [`rules/README.md`](rules/README.md) for installation and structure details.

---

## Which Agent Should I Use?

Not sure where to start? Use this quick reference. Skills are the canonical workflow surface; slash entries below are the compatibility form most users already know.

| I want to... | Use this command | Agent used |
|--------------|-----------------|------------|
| Plan a new feature | `/ecc:plan "Add auth"` | planner |
| Design system architecture | `/ecc:plan` + architect agent | architect |
| Write code with tests first | `/tdd` | tdd-guide |
| Review code I just wrote | `/code-review` | code-reviewer |
| Fix a failing build | `/build-fix` | build-error-resolver |
| Run end-to-end tests | `/e2e` | e2e-runner |
| Find security vulnerabilities | `/security-scan` | security-reviewer |
| Remove dead code | `/refactor-clean` | refactor-cleaner |
| Update documentation | `/update-docs` | doc-updater |
| Review Go code | `/go-review` | go-reviewer |
| Review Python code | `/python-review` | python-reviewer |
| Review TypeScript/JavaScript code | *(invoke `typescript-reviewer` directly)* | typescript-reviewer |
| Audit database queries | *(auto-delegated)* | database-reviewer |

### Common Workflows

Slash forms below are shown because they are still the fastest familiar entrypoint. Under the hood, ECC is shifting these workflows toward skills-first definitions.

**Starting a new feature:**
```
/ecc:plan "Add user authentication with OAuth"
                                              → planner creates implementation blueprint
/tdd                                          → tdd-guide enforces write-tests-first
/code-review                                  → code-reviewer checks your work
```

**Fixing a bug:**
```
/tdd                                          → tdd-guide: write a failing test that reproduces it
                                              → implement the fix, verify test passes
/code-review                                  → code-reviewer: catch regressions
```

**Preparing for production:**
```
/security-scan                                → security-reviewer: OWASP Top 10 audit
/e2e                                          → e2e-runner: critical user flow tests
/test-coverage                                → verify 80%+ coverage
```

---

## FAQ

<details>
<summary><b>How do I check which agents/commands are installed?</b></summary>

```bash
/plugin list VF-Claude-Plugin@VF-Claude-Plugin
```

This shows all available agents, commands, and skills from the plugin.
</details>

<details>
<summary><b>My hooks aren't working / I see "Duplicate hooks file" errors</b></summary>

This is the most common issue. **Do NOT add a `"hooks"` field to `.claude-plugin/plugin.json`.** Claude Code v2.1+ automatically loads `hooks/hooks.json` from installed plugins. Explicitly declaring it causes duplicate detection errors.
</details>

<details>
<summary><b>Can I use ECC with Claude Code on a custom API endpoint or model gateway?</b></summary>

Yes. ECC does not hardcode Anthropic-hosted transport settings. It runs locally through Claude Code's normal CLI/plugin surface, so it works with:

- Anthropic-hosted Claude Code
- Official Claude Code gateway setups using `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN`
- Compatible custom endpoints that speak the Anthropic API Claude Code expects

Minimal example:

```bash
export ANTHROPIC_BASE_URL=https://your-gateway.example.com
export ANTHROPIC_AUTH_TOKEN=your-token
claude
```

If your gateway remaps model names, configure that in Claude Code rather than in ECC. ECC's hooks, skills, commands, and rules are model-provider agnostic once the `claude` CLI is already working.

Official references:
- [Claude Code LLM gateway docs](https://docs.anthropic.com/en/docs/claude-code/llm-gateway)
- [Claude Code model configuration docs](https://docs.anthropic.com/en/docs/claude-code/model-config)

</details>

<details>
<summary><b>My context window is shrinking / Claude is running out of context</b></summary>

Too many MCP servers eat your context. Each MCP tool description consumes tokens from your 200k window, potentially reducing it to ~70k.

**Fix:** Disable unused MCPs per project:
```json
// In your project's .claude/settings.json
{
  "disabledMcpServers": ["supabase", "railway", "vercel"]
}
```

Keep under 10 MCPs enabled and under 80 tools active.
</details>

<details>
<summary><b>Can I use only some components (e.g., just agents)?</b></summary>

Yes. Use Option 2 (manual installation) and copy only what you need:

```bash
# Just agents
cp VF-Claude-Plugin/agents/*.md ~/.claude/agents/

# Just rules
mkdir -p ~/.claude/rules/
cp -r VF-Claude-Plugin/rules/common ~/.claude/rules/
```

Each component is fully independent.
</details>

<details>
<summary><b>Does this work with Cursor / OpenCode / Codex / Antigravity?</b></summary>

Yes. ECC is cross-platform:
- **Cursor**: Pre-translated configs in `.cursor/`. See [Cursor IDE Support](#cursor-ide-support).
- **Gemini CLI**: Experimental project-local support via `.gemini/GEMINI.md` and shared installer plumbing.
- **OpenCode**: Full plugin support in `.opencode/`. See [OpenCode Support](#opencode-support).
- **Codex**: First-class support for both macOS app and CLI, with adapter drift guards and SessionStart fallback. See PR [#257](https://github.com/Vfast-cbowlby/VF-Claude-Plugin/pull/257).
- **Antigravity**: Tightly integrated setup for workflows, skills, and flattened rules in `.agent/`. See [Antigravity Guide](docs/ANTIGRAVITY-GUIDE.md).
- **Non-native harnesses**: Manual fallback path for Grok and similar interfaces. See [Manual Adaptation Guide](docs/MANUAL-ADAPTATION-GUIDE.md).
- **Claude Code**: Native — this is the primary target.
</details>

<details>
<summary><b>How do I contribute a new skill or agent?</b></summary>

All Verifast team members are welcome to contribute. The short version:
1. Branch from `main`
2. Create your skill in `skills/your-skill-name/SKILL.md` (with YAML frontmatter)
3. Or create an agent in `agents/your-agent.md`
4. Submit a PR with a clear description of what it does and why it improves performance

See [CONTRIBUTING.md](CONTRIBUTING.md) for format details.
</details>

---

## Running Tests

The plugin includes a comprehensive test suite:

```bash
# Run all tests
node tests/run-all.js

# Run individual test files
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

---

## Contributing

All Verifast engineers are encouraged to improve this plugin. If you have useful agents, skills, hooks, MCP configurations, or improved rules, submit a PR with a reason for the change. PRs that demonstrably improve performance will be approved.

See [CONTRIBUTING.md](CONTRIBUTING.md) for format and submission guidelines.

---

## Cursor IDE Support

ECC provides **full Cursor IDE support** with hooks, rules, agents, skills, commands, and MCP configs adapted for Cursor's native format.

### Quick Start (Cursor)

```bash
# macOS/Linux
./install.sh --target cursor typescript
./install.sh --target cursor python golang swift php
```

```powershell
# Windows PowerShell
.\install.ps1 --target cursor typescript
.\install.ps1 --target cursor python golang swift php
```

### What's Included

| Component | Count | Details |
|-----------|-------|---------|
| Hook Events | 15 | sessionStart, beforeShellExecution, afterFileEdit, beforeMCPExecution, beforeSubmitPrompt, and 10 more |
| Hook Scripts | 16 | Thin Node.js scripts delegating to `scripts/hooks/` via shared adapter |
| Rules | 34 | 9 common (alwaysApply) + 25 language-specific (TypeScript, Python, Go, Swift, PHP) |
| Agents | Shared | Via AGENTS.md at root (read by Cursor natively) |
| Skills | Shared + Bundled | Via AGENTS.md at root and `.cursor/skills/` for translated additions |
| Commands | Shared | `.cursor/commands/` if installed |
| MCP Config | Shared | `.cursor/mcp.json` if installed |

### Hook Architecture (DRY Adapter Pattern)

Cursor has **more hook events than Claude Code** (20 vs 8). The `.cursor/hooks/adapter.js` module transforms Cursor's stdin JSON to Claude Code's format, allowing existing `scripts/hooks/*.js` to be reused without duplication.

```
Cursor stdin JSON → adapter.js → transforms → scripts/hooks/*.js
                                              (shared with Claude Code)
```

Key hooks:
- **beforeShellExecution** — Blocks dev servers outside tmux (exit 2), git push review
- **afterFileEdit** — Auto-format + TypeScript check + console.log warning
- **beforeSubmitPrompt** — Detects secrets (sk-, ghp_, AKIA patterns) in prompts
- **beforeTabFileRead** — Blocks Tab from reading .env, .key, .pem files (exit 2)
- **beforeMCPExecution / afterMCPExecution** — MCP audit logging

### Rules Format

Cursor rules use YAML frontmatter with `description`, `globs`, and `alwaysApply`:

```yaml
---
description: "TypeScript coding style extending common rules"
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: false
---
```

---

## Codex macOS App + CLI Support

ECC provides **first-class Codex support** for both the macOS app and CLI, with a reference configuration, Codex-specific AGENTS.md supplement, and shared skills.

### Quick Start (Codex App + CLI)

```bash
# Run Codex CLI in the repo — AGENTS.md and .codex/ are auto-detected
codex

# Automatic setup: sync ECC assets (AGENTS.md, skills, MCP servers) into ~/.codex
npm install && bash scripts/sync-ecc-to-codex.sh
# or: pnpm install && bash scripts/sync-ecc-to-codex.sh
# or: yarn install && bash scripts/sync-ecc-to-codex.sh
# or: bun install && bash scripts/sync-ecc-to-codex.sh

# Or manually: copy the reference config to your home directory
cp .codex/config.toml ~/.codex/config.toml
```

The sync script safely merges ECC MCP servers into your existing `~/.codex/config.toml` using an **add-only** strategy — it never removes or modifies your existing servers. Run with `--dry-run` to preview changes, or `--update-mcp` to force-refresh ECC servers to the latest recommended config.

For Context7, ECC uses the canonical Codex section name `[mcp_servers.context7]` while still launching the `@upstash/context7-mcp` package. If you already have a legacy `[mcp_servers.context7-mcp]` entry, `--update-mcp` migrates it to the canonical section name.

Codex macOS app:
- Open this repository as your workspace.
- The root `AGENTS.md` is auto-detected.
- `.codex/config.toml` and `.codex/agents/*.toml` work best when kept project-local.
- The reference `.codex/config.toml` intentionally does not pin `model` or `model_provider`, so Codex uses its own current default unless you override it.
- Optional: copy `.codex/config.toml` to `~/.codex/config.toml` for global defaults; keep the multi-agent role files project-local unless you also copy `.codex/agents/`.

### What's Included

| Component | Count | Details |
|-----------|-------|---------|
| Config | 1 | `.codex/config.toml` — top-level approvals/sandbox/web_search, MCP servers, notifications, profiles |
| AGENTS.md | 2 | Root (universal) + `.codex/AGENTS.md` (Codex-specific supplement) |
| Skills | 30 | `.agents/skills/` — SKILL.md + agents/openai.yaml per skill |
| MCP Servers | 6 | GitHub, Context7, Exa, Memory, Playwright, Sequential Thinking (7 with Supabase via `--update-mcp` sync) |
| Profiles | 2 | `strict` (read-only sandbox) and `yolo` (full auto-approve) |
| Agent Roles | 3 | `.codex/agents/` — explorer, reviewer, docs-researcher |

### Skills

Skills at `.agents/skills/` are auto-loaded by Codex:

| Skill | Description |
|-------|-------------|
| api-design | REST API design patterns |
| article-writing | Long-form writing from notes and voice references |
| backend-patterns | API design, database, caching |
| brand-voice | Source-derived writing style profiles from real content |
| bun-runtime | Bun as runtime, package manager, bundler, and test runner |
| claude-api | Anthropic Claude API patterns for Python and TypeScript |
| coding-standards | Universal coding standards |
| content-engine | Platform-native social content and repurposing |
| crosspost | Multi-platform content distribution across X, LinkedIn, Threads |
| deep-research | Multi-source research with synthesis and source attribution |
| dmux-workflows | Multi-agent orchestration using tmux pane manager |
| documentation-lookup | Up-to-date library and framework docs via Context7 MCP |
| e2e-testing | Playwright E2E tests |
| eval-harness | Eval-driven development |
| VF-Claude-Plugin | Development conventions and patterns for the project |
| exa-search | Neural search via Exa MCP for web, code, company research |
| fal-ai-media | Unified media generation for images, video, and audio |
| frontend-patterns | React/Next.js patterns |
| frontend-slides | HTML presentations, PPTX conversion, visual style exploration |
| investor-materials | Decks, memos, models, and one-pagers |
| investor-outreach | Personalized outreach, follow-ups, and intro blurbs |
| market-research | Source-attributed market and competitor research |
| mcp-server-patterns | Build MCP servers with Node/TypeScript SDK |
| nextjs-turbopack | Next.js 16+ and Turbopack incremental bundling |
| security-review | Comprehensive security checklist |
| strategic-compact | Context management |
| tdd-workflow | Test-driven development with 80%+ coverage |
| verification-loop | Build, test, lint, typecheck, security |
| video-editing | AI-assisted video editing workflows with FFmpeg and Remotion |
| x-api | X/Twitter API integration for posting and analytics |

### Key Limitation

Codex does **not yet provide Claude-style hook execution parity**. ECC enforcement there is instruction-based via `AGENTS.md`, optional `model_instructions_file` overrides, and sandbox/approval settings.

### Multi-Agent Support

Current Codex builds support stable multi-agent workflows.

- Enable `features.multi_agent = true` in `.codex/config.toml`
- Define roles under `[agents.<name>]`
- Point each role at a file under `.codex/agents/`
- Use `/agent` in the CLI to inspect or steer child agents

ECC ships three sample role configs:

| Role | Purpose |
|------|---------|
| `explorer` | Read-only codebase evidence gathering before edits |
| `reviewer` | Correctness, security, and missing-test review |
| `docs_researcher` | Documentation and API verification before release/docs changes |

---

## OpenCode Support

ECC provides **full OpenCode support** including plugins and hooks.

### Quick Start

```bash
# Install OpenCode
npm install -g opencode

# Run in the repository root
opencode
```

The configuration is automatically detected from `.opencode/opencode.json`.

### Feature Parity

| Feature | Claude Code | OpenCode | Status |
|---------|-------------|----------|--------|
| Agents | PASS: 47 agents | PASS: 12 agents | **Claude Code leads** |
| Commands | PASS: 79 commands | PASS: 31 commands | **Claude Code leads** |
| Skills | PASS: 193 skills | PASS: 37 skills | **Claude Code leads** |
| Hooks | PASS: 8 event types | PASS: 11 events | **OpenCode has more!** |
| Rules | PASS: 29 rules | PASS: 13 instructions | **Claude Code leads** |
| MCP Servers | PASS: 14 servers | PASS: Full | **Full parity** |
| Custom Tools | PASS: Via hooks | PASS: 6 native tools | **OpenCode is better** |

### Hook Support via Plugins

OpenCode's plugin system is MORE sophisticated than Claude Code with 20+ event types:

| Claude Code Hook | OpenCode Plugin Event |
|-----------------|----------------------|
| PreToolUse | `tool.execute.before` |
| PostToolUse | `tool.execute.after` |
| Stop | `session.idle` |
| SessionStart | `session.created` |
| SessionEnd | `session.deleted` |

**Additional OpenCode events**: `file.edited`, `file.watcher.updated`, `message.updated`, `lsp.client.diagnostics`, `tui.toast.show`, and more.

### Available Slash Entry Shims (31+)

| Command | Description |
|---------|-------------|
| `/plan` | Create implementation plan |
| `/tdd` | Enforce TDD workflow |
| `/code-review` | Review code changes |
| `/build-fix` | Fix build errors |
| `/e2e` | Generate E2E tests |
| `/refactor-clean` | Remove dead code |
| `/orchestrate` | Multi-agent workflow |
| `/learn` | Extract patterns from session |
| `/checkpoint` | Save verification state |
| `/verify` | Run verification loop |
| `/eval` | Evaluate against criteria |
| `/update-docs` | Update documentation |
| `/update-codemaps` | Update codemaps |
| `/test-coverage` | Analyze coverage |
| `/go-review` | Go code review |
| `/go-test` | Go TDD workflow |
| `/go-build` | Fix Go build errors |
| `/python-review` | Python code review (PEP 8, type hints, security) |
| `/multi-plan` | Multi-model collaborative planning |
| `/multi-execute` | Multi-model collaborative execution |
| `/multi-backend` | Backend-focused multi-model workflow |
| `/multi-frontend` | Frontend-focused multi-model workflow |
| `/multi-workflow` | Full multi-model development workflow |
| `/pm2` | Auto-generate PM2 service commands |
| `/sessions` | Manage session history |
| `/skill-create` | Generate skills from git |
| `/instinct-status` | View learned instincts |
| `/instinct-import` | Import instincts |
| `/instinct-export` | Export instincts |
| `/evolve` | Cluster instincts into skills |
| `/promote` | Promote project instincts to global scope |
| `/projects` | List known projects and instinct stats |
| `/prune` | Delete expired pending instincts (30d TTL) |
| `/learn-eval` | Extract and evaluate patterns before saving |
| `/setup-pm` | Configure package manager |
| `/harness-audit` | Audit harness reliability, eval readiness, and risk posture |
| `/loop-start` | Start controlled agentic loop execution pattern |
| `/loop-status` | Inspect active loop status and checkpoints |
| `/quality-gate` | Run quality gate checks for paths or entire repo |
| `/model-route` | Route tasks to models by complexity and budget |

### Plugin Installation

**Option 1: Use directly**
```bash
cd VF-Claude-Plugin
opencode
```

**Option 2: Install as npm package**
```bash
npm install vcp
```

Then add to your `opencode.json`:
```json
{
  "plugin": ["vcp"]
}
```

That npm plugin entry enables ECC's published OpenCode plugin module (hooks/events and plugin tools).
It does **not** automatically add ECC's full command/agent/instruction catalog to your project config.

For the full ECC OpenCode setup, either:
- run OpenCode inside this repository, or
- copy the bundled `.opencode/` config assets into your project and wire the `instructions`, `agent`, and `command` entries in `opencode.json`

### Documentation

- **Migration Guide**: `.opencode/MIGRATION.md`
- **OpenCode Plugin README**: `.opencode/README.md`
- **Consolidated Rules**: `.opencode/instructions/INSTRUCTIONS.md`
- **LLM Documentation**: `llms.txt` (complete OpenCode docs for LLMs)

---

## Cross-Tool Feature Parity

ECC is the **first plugin to maximize every major AI coding tool**. Here's how each harness compares:

| Feature | Claude Code | Cursor IDE | Codex CLI | OpenCode |
|---------|------------|------------|-----------|----------|
| **Agents** | 47 | Shared (AGENTS.md) | Shared (AGENTS.md) | 12 |
| **Commands** | 79 | Shared | Instruction-based | 31 |
| **Skills** | 193 | Shared | 10 (native format) | 37 |
| **Hook Events** | 8 types | 15 types | None yet | 11 types |
| **Hook Scripts** | 20+ scripts | 16 scripts (DRY adapter) | N/A | Plugin hooks |
| **Rules** | 34 (common + lang) | 34 (YAML frontmatter) | Instruction-based | 13 instructions |
| **Custom Tools** | Via hooks | Via hooks | N/A | 6 native tools |
| **MCP Servers** | 14 | Shared (mcp.json) | 7 (auto-merged via TOML parser) | Full |
| **Config Format** | settings.json | hooks.json + rules/ | config.toml | opencode.json |
| **Context File** | CLAUDE.md + AGENTS.md | AGENTS.md | AGENTS.md | AGENTS.md |
| **Secret Detection** | Hook-based | beforeSubmitPrompt hook | Sandbox-based | Hook-based |
| **Auto-Format** | PostToolUse hook | afterFileEdit hook | N/A | file.edited hook |
| **Version** | Plugin | Plugin | Reference config | 1.10.0 |

**Key architectural decisions:**
- **AGENTS.md** at root is the universal cross-tool file (read by all 4 tools)
- **DRY adapter pattern** lets Cursor reuse Claude Code's hook scripts without duplication
- **Skills format** (SKILL.md with YAML frontmatter) works across Claude Code, Codex, and OpenCode
- Codex's lack of hooks is compensated by `AGENTS.md`, optional `model_instructions_file` overrides, and sandbox permissions

---

## Token Optimization

Claude Code usage can be expensive if you don't manage token consumption. These settings significantly reduce costs without sacrificing quality.

### Recommended Settings

Add to `~/.claude/settings.json`:

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```

| Setting | Default | Recommended | Impact |
|---------|---------|-------------|--------|
| `model` | opus | **sonnet** | ~60% cost reduction; handles 80%+ of coding tasks |
| `MAX_THINKING_TOKENS` | 31,999 | **10,000** | ~70% reduction in hidden thinking cost per request |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 95 | **50** | Compacts earlier — better quality in long sessions |

Switch to Opus only when you need deep architectural reasoning:
```
/model opus
```

### Daily Workflow Commands

| Command | When to Use |
|---------|-------------|
| `/model sonnet` | Default for most tasks |
| `/model opus` | Complex architecture, debugging, deep reasoning |
| `/clear` | Between unrelated tasks (free, instant reset) |
| `/compact` | At logical task breakpoints (research done, milestone complete) |
| `/cost` | Monitor token spending during session |

### Strategic Compaction

The `strategic-compact` skill (included in this plugin) suggests `/compact` at logical breakpoints instead of relying on auto-compaction at 95% context. See `skills/strategic-compact/SKILL.md` for the full decision guide.

**When to compact:**
- After research/exploration, before implementation
- After completing a milestone, before starting the next
- After debugging, before continuing feature work
- After a failed approach, before trying a new one

**When NOT to compact:**
- Mid-implementation (you'll lose variable names, file paths, partial state)

### Context Window Management

**Critical:** Don't enable all MCPs at once. Each MCP tool description consumes tokens from your 200k window, potentially reducing it to ~70k.

- Keep under 10 MCPs enabled per project
- Keep under 80 tools active
- Use `disabledMcpServers` in project config to disable unused ones

### Agent Teams Cost Warning

Agent Teams spawns multiple context windows. Each teammate consumes tokens independently. Only use for tasks where parallelism provides clear value (multi-module work, parallel reviews). For simple sequential tasks, subagents are more token-efficient.

---

### Customization

This plugin is a starting point. You should:
1. Start with what resonates with your workflow
2. Modify for your stack and Verifast-specific patterns
3. Remove what you don't use
4. Add your own patterns via a PR

---

## License

MIT - See [LICENSE](LICENSE) for details.
