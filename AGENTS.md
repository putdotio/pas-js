# Agent Guide

## Repo

- Single-package TypeScript repo for `@putdotio/pas-js`
- Browser analytics client built and packaged with Vite+
- Main code lives in `src/*`

## Start Here

- [Overview](./README.md)
- [Contributing](./CONTRIBUTING.md)
- [Distribution](./docs/DISTRIBUTION.md)
- [Security](./SECURITY.md)

## Commands

- `vp install`
- `vp config`
- `vp check .`
- `vp pack`
- `vp run test`
- `vp run coverage`
- `vp run test:consumer`
- `vp run verify`

## Repo-Specific Guidance

- Keep `README.md` consumer-facing. Put contributor workflow in `CONTRIBUTING.md` and keep `AGENTS.md` as the routing layer.
- Treat the package entrypoint in `src/index.ts` as the public contract. Add internal-path imports or exports only when the public API intentionally changes.
- Keep browser-only assumptions explicit. The package is expected to install and import cleanly outside the workspace, while default verification stays fixture-backed.
- Update docs when install, verify, or release-surface behavior changes.

## Testing

- Default `vp run verify` is unit-only plus package build and coverage.
- `vp run test:consumer` is the publication safety net. It proves the packed tarball installs, type-checks, imports, and rejects internal package paths from a temp consumer project.
- Keep live PAS calls out of the default guardrail until the repo has a dedicated low-risk fixture strategy.
