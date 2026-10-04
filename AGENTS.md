# Agent Guide

`@putdotio/pas-js` is a single-package TypeScript browser analytics client for
the put.io Analytics System, built and packaged with Vite+. put.io's web app
and website install it from npm. Code lives in `src/`.

## Start Here

- [Overview](./README.md): consumer usage
- [Contributing](./CONTRIBUTING.md): setup, validation, and the packed-consumer smoke
- [Distribution](./docs/DISTRIBUTION.md): npm release
- [Security policy](https://github.com/putdotio/.github/blob/main/SECURITY.md)

## Commands

The `scripts` block in [package.json](./package.json) defines every command.
Vite+ is the pinned `vite-plus` devDependency, so run it through
`pnpm exec vp`; no global install is needed.

## Worktrees

`.worktreeinclude` lists no files; no ignored local files are needed. In a
fresh worktree run `pnpm install`, `pnpm exec vp config`, then
`pnpm exec vp run verify`.

## Rules

- `src/index.ts` is the public contract. Add internal-path imports or exports
  only when the public API intentionally changes.
- The package must install and import cleanly outside the workspace; keep
  browser-only assumptions explicit.
- Default verification stays fixture-backed; keep live PAS calls out of it.
- Keep `README.md` consumer-facing and contributor workflow in
  `CONTRIBUTING.md`.
- Update docs when install, verification, or release behavior changes.

## Proof

- Docs only: `pnpm exec vp check .`; no runtime proof.
- Source change: `pnpm exec vp run verify`.
- Public API, exports, or packaging: also `pnpm exec vp run test:consumer`,
  the [publication smoke](./CONTRIBUTING.md#publication-smoke). CI runs it on
  every pull request.

## Delivery

Pull requests squash-merge to `main`. A push to `main` runs `verify` and
`test:consumer`, then semantic-release publishes `@putdotio/pas-js` to npm when
the commits since the last release include `feat`, `fix`, `perf`, or a
breaking change; `docs`, `chore`, `test`, and `ci` publish nothing. The
squashed commit's type is the version decision, and npm never accepts a
published version number again.
