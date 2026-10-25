# Contributing

## Setup

```bash
pnpm install
pnpm exec vp config
```

`pnpm exec vp config` installs the Git hooks in `.vite-hooks/`.

## Checks

```bash
pnpm exec vp run verify
pnpm exec vp run test:consumer
```

`verify` is the pull request gate. `test:consumer` installs the packed tarball
into a temporary project and checks the public API from outside the
workspace. CI runs both on every pull request.

## Pull Requests

- Add or update tests when behavior changes.
- Update docs when package usage, checks, or release behavior changes.
- Release: [Distribution](./docs/distribution.md).
