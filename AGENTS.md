# Agent Guide

`@putdotio/pas-js` is the browser analytics client for the put.io Analytics
System (PAS). put.io's web app and website install it from npm. Code lives in
`src/`.

- [README](./README.md): consumer usage.
- [Contributing](./CONTRIBUTING.md): setup and checks.
- [Distribution](./docs/distribution.md): open before touching `ci.yml`,
  `.releaserc.json`, or the `release` Environment.

## Commands

[package.json](./package.json) `scripts` defines every command. Run Vite+
through the pinned devDependency: `pnpm exec vp`.

A fresh worktree needs no ignored local files:

```bash
pnpm install
pnpm exec vp config
pnpm exec vp run verify
```

## Rules

- `src/index.ts` is the public contract. Add internal-path imports or exports
  only when the public API changes on purpose.
- The package must install and import cleanly outside the workspace; keep
  browser-only assumptions explicit.
- Default verification stays fixture-backed; keep live PAS calls out of it.
- `README.md` is for consumers; contributor workflow goes in
  `CONTRIBUTING.md`.

## Proof

- Docs only: `pnpm exec vp check .`.
- Source change: `pnpm exec vp run verify`.
- Public API, exports, or packaging: also `pnpm exec vp run test:consumer`.

## Delivery

Pull requests squash-merge to `main`, and every merge can publish to npm. The
squashed commit's type decides the release (see
[Distribution](./docs/distribution.md)); npm never accepts a published version
number again.
