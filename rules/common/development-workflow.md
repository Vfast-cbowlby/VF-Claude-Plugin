# Development Workflow

> This file extends [common/git-workflow.md](./git-workflow.md) with the full feature development process that happens before git operations.

The Feature Implementation Workflow describes the development pipeline: research, planning, TDD, code review, and then committing to git.

## Feature Implementation Workflow

0. **Research & Reuse** _(mandatory before any new implementation)_
   - **GitHub code search first:** Run `gh search repos` and `gh search code` to find existing implementations, templates, and patterns before writing anything new.
   - **Library docs second:** Use Context7 or primary vendor docs to confirm API behavior, package usage, and version-specific details before implementing.
   - **Exa only when the first two are insufficient:** Use Exa for broader web research or discovery after GitHub search and primary docs.
   - **Check package registries:** Search npm, PyPI, crates.io, and other registries before writing utility code. Prefer battle-tested libraries over hand-rolled solutions.
   - **Search for adaptable implementations:** Look for open-source projects that solve 80%+ of the problem and can be forked, ported, or wrapped.
   - Prefer adopting or porting a proven approach over writing net-new code when it meets the requirement.

1. **Plan First**
   - Use **planner** agent to create implementation plan
   - Generate planning docs before coding: PRD, architecture, system_design, tech_doc, task_list
   - Identify dependencies and risks
   - Break down into phases

2. **TDD Approach**
   - Use **tdd-guide** agent
   - Write tests first (RED)
   - Implement to pass tests (GREEN)
   - Refactor (IMPROVE)
   - Verify 80%+ coverage

3. **Code Review**
   - Use the **`requesting-code-review`** skill to dispatch the code-reviewer subagent with precisely crafted context (not your session history)
   - For language-specific pattern review, additionally dispatch the relevant ECC language agent (e.g., **java-reviewer**, **kotlin-reviewer**) as a supplementary pass
   - Use the **`receiving-code-review`** skill to evaluate and implement feedback — verify suggestions against the codebase before accepting, push back with technical reasoning when warranted
   - Address CRITICAL and HIGH issues before proceeding; fix MEDIUM issues when possible

4. **Commit & Push**
   - Use the **`finishing-a-development-branch`** skill to verify tests, choose your integration strategy (merge locally, PR, keep, or discard), and clean up the worktree
   - Follow conventional commits format; see [git-workflow.md](./git-workflow.md) for commit message format and PR body structure

5. **Pre-Review Checks**
   - Verify all automated checks (CI/CD) are passing
   - Resolve any merge conflicts
   - Ensure branch is up to date with target branch
   - Only request review after these checks pass
