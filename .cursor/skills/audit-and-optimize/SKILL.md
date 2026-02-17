---
name: audit-and-optimize
description: Runs a general audit and conservative optimization for the Mentara project. Use when the user asks for a general audit, optimization run, AFK audit workflow, or to run audit and optimization on frontend and backend. Scope is mentara-web and mentara-api only; no large refactors.
---

# Audit and Optimize Workflow

Run this workflow in order. Do not skip phases or apply fixes before saving state.

## Purpose

Perform a read-only audit of frontend and backend, save current state to master, then apply only small, low-risk fixes. Avoid broad refactors, new libraries, or many unrelated changes.

**Scope**: `mentara-web` (frontend), `mentara-api` (backend). Do not touch `ml-patient-evaluator-api` or infra-only code unless the user explicitly extends scope.

---

## Phase 1 – Audit (read-only)

1. Scan `mentara-web` and `mentara-api` for:
   - Obvious bugs, dead code, inconsistent patterns
   - Quick wins: unused deps, simple perf, lint/type fixes
   - Items to avoid: large refactors, broad renames, new libs
2. Produce a short **audit report**: findings plus prioritized, minimal recommendations.
3. **Do not edit any files** in this phase.

---

## Phase 2 – Commit and push to master (before any refactoring)

1. Stage and commit current state with a conventional message, e.g. `chore: snapshot before audit fixes`.
2. **Show the git commands** you will run.
3. **Ask for explicit confirmation** before running `git push origin master`. Do not push without confirmation.
4. Use only safe git: no `--force`, no `rebase`, no `reset --hard`, no `clean -fd`.

---

## Phase 3 – Fixes / optimization (conservative)

1. Apply only changes that are **small and low-risk**: lint/type fixes, obvious dead code removal, simple perf or dependency cleanups.
2. Stay within `mentara-web` and `mentara-api`.
3. Prefer **one concern per commit** (one fix type or one area).
4. After applying fixes, give a brief summary of what changed.

**Do not**: big refactors, rename files/folders, add new libraries, change architecture, or bundle many unrelated edits in one go.

---

## Constraints (out of scope)

- No broad refactors or "clean up the whole module"
- No new dependencies or architectural changes
- No changes to ml-patient-evaluator-api unless user extends scope
- No force push, rebase, or reset; only normal commit and push with confirmation

---

## Single-prompt examples

User can trigger this workflow with any of:

- "Run the audit and optimization."
- "Do the audit/optimization workflow."
- "General audit and optimization, then commit and push to master, then conservative fixes on frontend and backend only."
