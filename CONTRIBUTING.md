# Contributing

Thanks for contributing to `@putdotio/pas-js`

## Setup

Install dependencies with Vite+:

```bash
vp install
```

## Validation

Run the repo guardrail before opening or updating a pull request:

```bash
vp run verify
```

That command runs formatting, linting, package build, unit tests, and coverage using the same entrypoint CI relies on.

## Development Notes

- Prefer `vp` for day-to-day commands
- Put end-user package usage in [README.md](./README.md)
- Keep contributor workflow changes in this file and security reporting guidance in [SECURITY.md](./SECURITY.md)

## Pull Requests

- Keep changes focused
- Add or update tests when behavior changes
- Update docs when package usage, validation, or release behavior changes
