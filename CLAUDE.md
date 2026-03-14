# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Primary Framework Reference:** See `.claude/CLAUDE.md` for comprehensive AIOX framework rules, Constitution, agent authority, and governance.

---

## Quick Reference: Development Workflows

### Story Development Cycle (Primary Workflow)

All development follows story-driven methodology. Complete workflow in order:

```
@sm *create-story         → Draft story from epic/PRD
  ↓
@po *validate-story       → Validate 10-point checklist (GO/NO-GO)
  ↓
@dev *develop             → Implement acceptance criteria
  ↓
@qa *qa-gate              → Quality gate review (7 checks)
  ↓
@devops *push             → Merge to main, create release
```

**Status progression:** Draft → Ready → InProgress → InReview → Done

### QA Loop (Iterative Review)
If QA gate returns issues, @dev fixes and @qa re-reviews (max 5 iterations):
```
@qa review → @dev fixes → @qa re-review → (repeat) → PASS
```

### Spec Pipeline (Complex Features)
For features scoring 9+ on complexity:
```
@pm gather → @architect assess → @analyst research → @pm write-spec → @qa critique → @architect plan
```

**Complexity Score:** 1-5 per dimension (scope, integration, infrastructure, knowledge, risk)
- Score ≤ 8: SIMPLE (skip phases)
- Score 9-15: STANDARD (full pipeline)
- Score ≥ 16: COMPLEX (includes revision)

### Brownfield Discovery (Existing Systems)
10-phase assessment for codebases with tech debt:
- Phases 1-3: Data collection (@architect, @data-engineer, @ux-design-expert)
- Phases 4-7: Draft & validation
- Phases 8-10: Finalization & report

---

## Project Structure

```
cz-sys-aiox/
├── .aiox-core/              # Framework (L1-L2: READ-ONLY via deny rules)
│   ├── core/                # Framework core (protected)
│   ├── constitution.md      # Formal principles (inviolable)
│   ├── development/         # Agent definitions, task templates, checklists
│   ├── data/                # Project-specific data (L3: mutable)
│   └── cli/                 # AIOX CLI commands
├── .claude/                 # Claude Code configuration
│   ├── CLAUDE.md            # Framework governance & rules
│   ├── rules/               # Contextual rules (agent-authority, workflow-execution, etc.)
│   └── settings.json        # Tool access & deny/allow rules
├── docs/
│   ├── stories/             # Development stories (numbered: 1.1, 1.2, 2.1, etc.)
│   ├── prd/                 # Product requirements (v4, sharded by epic)
│   ├── architecture/        # Architecture docs (v4, sharded by domain)
│   ├── qa/                  # QA artifacts & checklists
│   └── framework/           # Framework documentation
├── .ai/                     # AI runtime (decision logs, debug, project status)
├── .agent/                  # Agent CLI configuration
├── .codex/, .cursor/        # IDE-specific config (Codex, Cursor)
├── AGENTS.md                # Agent shortcuts & Codex CLI rules
└── package.json             # Project dependencies
```

**Key Paths:**
- **Stories:** `docs/stories/` — New development always starts here
- **PRD:** `docs/prd/` — Functional & non-functional requirements
- **Architecture:** `docs/architecture/` — System design & patterns
- **Decisions:** `.ai/` — Logged decisions (ADR format)
- **Framework Config:** `.aiox-core/core-config.yaml` — Project settings

---

## Common Commands

### Development
```bash
npm run lint                 # Check code style (ESLint)
npm run typecheck            # Verify TypeScript
npm test                     # Run all tests (unit + integration)
npm test -- --testNamePattern="search term"  # Single test
npm run build                # Build project
```

### Framework
```bash
aiox doctor                  # Health check (code-intel, rules, boundary)
aiox graph --deps            # Dependency tree (ASCII)
aiox graph --deps --format=html  # Interactive HTML dependency graph
aiox validate:structure      # Validate AIOX structure
aiox validate:agents         # Validate agent definitions
```

### Git
```bash
git status                   # Check uncommitted changes
git log --oneline -5         # Recent commits
git diff main...HEAD         # All changes since branching from main
gh pr create                 # Create PR (via @devops)
gh issue list --state open   # List open issues
```

### Story Management
```
@dev *status                 # Current story & task status
@dev *list-stories           # All stories in project
```

---

## Development Checklist

**Before marking a task as complete:**

- [ ] **Tests pass:** `npm test` — All unit & integration tests green
- [ ] **Linting passes:** `npm run lint` — No style violations
- [ ] **Type checking passes:** `npm run typecheck` — TypeScript validates
- [ ] **Build succeeds:** `npm run build` — Artifact builds cleanly
- [ ] **Story updated:**
  - [ ] Progress checkboxes: [ ] → [x]
  - [ ] File List section current
  - [ ] Acceptance criteria addressed
- [ ] **Code quality:**
  - [ ] No CRITICAL issues from CodeRabbit
  - [ ] Edge cases tested
  - [ ] Error handling in place

**Before PR creation (via @devops):**
- [ ] All above checklist items complete
- [ ] Story marked as "InReview" or "Ready for Review"
- [ ] Commit message follows conventional format: `feat:`, `fix:`, `docs:`, etc.
- [ ] Branch is up-to-date with `main`

---

## Agent Quick Reference

| Agent | Use For | Key Command |
|-------|---------|------------|
| **@sm** (River) | Create stories from epics/PRD | `*draft`, `*create-story` |
| **@po** (Pax) | Validate story quality, prioritization | `*validate-story-draft` |
| **@dev** (Dex) | Implement features, fix bugs | `*develop`, `*task` |
| **@qa** (Quinn) | Quality gates, automated reviews | `*qa-gate`, `*qa-loop` |
| **@architect** (Aria) | System design, technology decisions | `*assess-complexity`, `*design` |
| **@data-engineer** (Dara) | Schema design, database optimization | `*design-schema`, `*optimize` |
| **@pm** (Morgan) | Epic orchestration, requirements | `*create-epic`, `*execute-epic` |
| **@analyst** (Alex) | Research, feasibility analysis | `*research`, `*analyze` |
| **@ux-design-expert** (Uma) | UI/UX design, component specs | `*design-ui`, `*create-spec` |
| **@devops** (Gage) | Git push, PR merge, CI/CD | `*push`, `*merge` |
| **@aiox-master** | Framework governance, escalations | *Override any boundary* |

**Escalation:** If an agent cannot complete a task → delegate to `@aiox-master` or appropriate specialist.

---

## Troubleshooting & Debugging

### Check Current Status
```
@dev *status                # Show active story & tasks
git branch -v               # Current branch & tracking
git status                  # Uncommitted changes
```

### View Logs
```
cat .ai/debug-log.md        # AI operation logs
tail -f .aiox/project-status.yaml  # Live project status
```

### Run Single Test
```bash
npm test -- --testNamePattern="test name"
```

### Validate Project Health
```bash
aiox doctor
# Output shows: code-intel status, rules loaded, boundary protection, agent definitions
```

### Understand Recent Changes
```bash
git diff main...HEAD --stat          # File-level changes summary
git log --oneline main...HEAD        # All commits since branching
git show <commit-hash>               # View specific commit details
```

### When Stuck

1. **Cannot find a story?** → `@dev *list-stories` or check `docs/stories/`
2. **Not sure which agent to use?** → Check Agent Quick Reference above
3. **Acceptance criteria unclear?** → Review story file (`.md` has full requirements)
4. **Tests failing?** → Check error output, run single test with `--testNamePattern`
5. **Type errors?** → `npm run typecheck -- --pretty` for formatted errors
6. **Agent unavailable?** → Escalate to `@aiox-master` with context

---

## Framework Boundaries

**AIOX protects framework integrity with 4 layers (L1-L4):**

| Layer | Mutability | Examples | Rule |
|-------|-----------|----------|------|
| **L1** Core | 🔴 Never | `.aiox-core/core/`, `constitution.md`, `bin/aiox.js` | Protected by deny rules |
| **L2** Templates | 🔴 Never | `.aiox-core/development/tasks/`, templates, checklists | Extend-only, protected |
| **L3** Config | 🟡 Exceptions | `.aiox-core/data/`, MEMORY.md, `core-config.yaml` | Allow rules permit changes |
| **L4** Runtime | 🟢 Always | `docs/stories/`, code, tests, decisions | This is where you work |

**Key Rule:** Never modify framework templates. Extend them or delegate to @aiox-master if you need framework changes.

---

## Constitution Quick Reference

Five inviolable principles enforced by automatic gates:

| Article | Principle | Key Rules |
|---------|-----------|-----------|
| **I** | CLI First | Functionality must work 100% via CLI before UI. UI is observational only. |
| **II** | Agent Authority | Only @devops can `git push`. Only @qa can give quality verdicts. No overrides. |
| **III** | Story-Driven | Zero code without a story. All work tracked in story checkboxes. |
| **IV** | No Invention | Every spec statement must trace to FR/NFR/constraint or research finding. |
| **V** | Quality First | Tests, lint, typecheck, build ALL must pass before merge. No exceptions. |

**Gates Block Violations:** Attempting to bypass any principle triggers automatic enforcement.

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `.aiox-core/constitution.md` | Formal inviolable principles (read when confused) |
| `.claude/CLAUDE.md` | Framework governance & complete rules (governance reference) |
| `.claude/rules/` | Contextual rules (auto-load based on file edits) |
| `.aiox-core/core-config.yaml` | Project settings (story location, PRD path, etc.) |
| `AGENTS.md` | Agent shortcuts & Codex CLI integration |
| `docs/stories/` | **Where all development starts** |
| `.ai/decision-logs-index.md` | Index of all ADR decisions |

---

## Before Starting Work

1. **Check active story:** `@dev *status`
2. **Read story file:** `docs/stories/{epic}.{story}.story.md`
3. **Understand acceptance criteria:** Listed in story file
4. **Check blocked items:** Any `- [ ]` tasks in story
5. **Review recent decisions:** `.ai/decision-logs-index.md`

---

## After Completing Work

1. **Mark tasks complete:** [ ] → [x] in story file
2. **Update File List:** Add/remove files modified
3. **Run quality gates:**
   ```bash
   npm test && npm run lint && npm run typecheck && npm run build
   ```
4. **Update story status:** Drag to "InReview" or "Ready for Review"
5. **Request code review:** Tag `@qa` or request PR via `@devops`

---

## Reference Documentation

- **Complete framework rules:** `.claude/CLAUDE.md`
- **Constitution (formal principles):** `.aiox-core/constitution.md`
- **Agent authority matrix:** `.claude/rules/agent-authority.md`
- **Workflow execution details:** `.claude/rules/workflow-execution.md`
- **Story lifecycle & gates:** `.claude/rules/story-lifecycle.md`
- **Agent handoff protocol:** `.claude/rules/agent-handoff.md`
- **Code standards:** `docs/framework/coding-standards.md` (if present)
