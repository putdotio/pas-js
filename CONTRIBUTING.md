# Contributing

## Setup

```bash
vp install
vp config
```

`vp config` installs the Git hooks in `.vite-hooks/`.

## Validation

```bash
vp run verify
```

This is the pull request gate and the CI entrypoint: formatting, linting,
unused-code checks, package build, unit tests, and coverage.

## Publication Smoke

```bash
vp run test:consumer
```

Packs the package, installs the tarball into a temporary project, type-checks
the public API, checks runtime import and malformed retry-cookie recovery in
jsdom, and confirms internal package paths stay private. CI runs it on every
pull request.

## Release

See [Distribution](./docs/DISTRIBUTION.md).

## Pull Requests

- Add or update tests when behavior changes.
- Update docs when package usage, validation, or release behavior changes.
