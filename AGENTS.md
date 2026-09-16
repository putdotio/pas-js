# Agent Guide

## Repo

- Single-package TypeScript repo for `@putdotio/pas-js`
- Browser analytics client built and packaged with Vite+
- Main code lives in `src/*`

## Start Here

- [Overview](./README.md)
- [Contributing](./CONTRIBUTING.md) — setup, `vp run verify`, and the packed-consumer smoke
- [Distribution](./docs/DISTRIBUTION.md)
- [Security](./SECURITY.md)

## Commands

The `scripts` block in [package.json](./package.json) defines every command. The gate is
`vp run verify` (unit-only plus package build and coverage); `vp run test:consumer`
is the publication safety net described in [Contributing](./CONTRIBUTING.md#publication-smoke).

## Worktrees

`.worktreeinclude` is tracked and lists no files by design; no ignored local
files are needed. In a fresh worktree run `vp install`, `vp config`, then
`vp run verify`.

## Repo-Specific Guidance

- Keep `README.md` consumer-facing. Put contributor workflow in `CONTRIBUTING.md` and keep `AGENTS.md` as the routing layer.
- Treat the package entrypoint in `src/index.ts` as the public contract. Add internal-path imports or exports only when the public API intentionally changes.
- Keep browser-only assumptions explicit. The package is expected to install and import cleanly outside the workspace, while default verification stays fixture-backed.
- Keep live PAS calls out of the default guardrail until the repo has a dedicated low-risk fixture strategy.
- Update docs when install, verify, or release-surface behavior changes.
