---
name: readme-catalog
description: Keep the VF-Claude-Plugin README Skills Catalog in sync with the skills/ directory. Run after adding, removing, or renaming any skill. Use when the catalog counts or skill entries are out of date.
origin: VF-Claude-Plugin
---

# README Catalog Maintenance

Keep the Skills Catalog table in `README.md` current whenever skills are added, removed, or renamed.

## When to Activate

- After adding a new skill to `skills/<name>/SKILL.md`
- After removing or renaming a skill directory
- When CI reports catalog count mismatches
- When someone reports a skill is missing from the README

## Maintenance Steps

### 1. Update Counts (Automated)

```bash
node scripts/ci/catalog.js --write --text
```

This rewrites the numeric counts (e.g., `194 workflow skills`) in the README quick-start summary, comparison table, parity table, AGENTS.md, README.zh-CN.md, and the zh-CN docs. **It does not update skill entries in the catalog table.**

### 2. Audit Missing Entries

```bash
# Get all actual skill directory names
ls skills/ | sort > /tmp/skills_actual.txt

# Extract skill names currently listed in the README catalog table
grep -oP '(?<=^| )`\K[a-z][a-z0-9-]+(?=`\s*\|)' README.md | sort -u > /tmp/readme_catalog.txt

# Show what's in skills/ but not in the README catalog
comm -23 /tmp/skills_actual.txt /tmp/readme_catalog.txt
```

### 3. Add Missing Skills

For each missing skill, get its description from the SKILL.md frontmatter:

```bash
# Get description for a specific skill
grep "^description:" skills/<name>/SKILL.md | sed 's/description: *//'
```

Add a row to the appropriate category table in the `## Skills Catalog` section of `README.md`:

```markdown
| `skill-name` | Short description from SKILL.md frontmatter |
```

**Category placement guide:**

| Category | Belongs here |
|----------|-------------|
| AI & Agent Engineering | agent-*, agentic-*, autonomous-*, council, eval-harness, gan-*, santa-method, safety-guard, subagent-* |
| Writing & Content | article-writing, brand-voice, content-engine, crosspost, deep-research, manim-video, remotion-*, video-* |
| Development Workflow | *-debugging, *-workflow, git-*, code-tour, codebase-*, benchmark, brainstorming, executing-*, writing-* |
| Frontend & Design | browser-qa, click-path-audit, design-system, frontend-*, svg-diagrams, ui-demo |
| Language sections | Match by language prefix: golang-*, python-*, django-*, java-*, springboot-*, kotlin-*, swift-*, dart-*, cpp-*, rust-*, csharp-*, dotnet-*, perl-*, laravel-* |
| Database & Data | clickhouse-io, dashboard-builder, database-*, postgres-* |
| API Design & Architecture | api-*, deployment-*, docker-*, e2e-testing, hexagonal-*, mcp-server-*, nutrient-* |
| Security | *-security, hipaa-*, security-* |
| Healthcare | healthcare-*, hipaa-* |
| Integrations & Tools | claude-api, documentation-lookup, exa-search, fal-ai-media, github-ops, google-workspace-ops, jira-* |
| Business & Operations | *-ops, *-billing, *-management, carrier-*, connections-*, customs-*, energy-*, inventory-*, logistics-*, production-*, quality-*, returns-* |
| VCP Meta | configure-ecc, context-budget, ecc-tools-*, hookify-*, plankton-*, repo-scan, skill-* |
| Blockchain & Web3 | defi-*, evm-*, llm-trading-*, nodejs-keccak256 |

### 4. Update the Tree Reference Line

The `## What's Inside` code block has a single-line reference:

```
|-- skills/           # 194 workflow skills — see Skills Catalog below
```

Update the count to match after adding/removing skills.

### 5. Commit

```bash
git add README.md
git commit -m "docs: add <skill-name> to README Skills Catalog"
```

## Quality Gate

Before pushing:

- [ ] `node scripts/ci/catalog.js --text` outputs `Documentation counts match`
- [ ] Every entry in `ls skills/` has a row in the Skills Catalog table
- [ ] No duplicate rows in any category table
- [ ] Skill name in backticks matches the actual directory name exactly

## What NOT to Do

- Do not list skills in the `## What's Inside` code block tree — that section shows project structure, not a full catalog
- Do not add entries to the Codex "What's Included" table unless the skill is explicitly bundled for Codex
- Do not run catalog.js in read-only mode and assume it passes the content check — it only validates counts
