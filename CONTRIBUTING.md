# Contributing to ArabName Toolkit

Thanks for considering a contribution. This is a small, static, client-side tool maintained by
volunteers — please keep pull requests focused and scoped.

## Before you start

1. Read [`CLAUDE.md`](CLAUDE.md) for project structure, conventions, and the "Never do this"
   list.
2. Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and skim the [`docs/adr/`](docs/adr/)
   records — they explain _why_ the codebase is shaped the way it is (no backend, no router, no
   global state library, etc.). Proposals that add one of these should include a new ADR.

## Setup

```bash
git clone https://github.com/talmurshidi/arabname-toolkit.git
cd arabname-toolkit
npm ci
npm run dev
```

## Making a change

1. Create a branch off `main`.
2. Make your change. Keep it scoped to one concern per pull request.
3. If you touched exported symbols, run `npm run docs:tree` to refresh `PROJECT_TREE.md`.
4. If you touched an architectural rule (layering, framework, build target), add a new ADR under
   `docs/adr/` and link it from `docs/ARCHITECTURE.md`.
5. Add or update tests — see the "Testing" section of `CLAUDE.md`, especially the required
   coverage for any transliteration dictionary/correction change.
6. Add an entry to `CHANGELOG.md` under "Unreleased".
7. Run the full gate locally before opening a PR:

   ```bash
   npm run verify
   ```

   This runs format-check, lint, typecheck, tests, the docs-tree check, and a production build,
   in that order — the same checks CI runs.

## Adding transliteration dictionary entries or corrections

These are the most common contribution type and have specific rules — see the "Adding dictionary
entries" and "Adding sourced corrections" sections of `CLAUDE.md`. In short:

- **Never guess.** Every correction must cite a verifiable source (a specific edition, page, or
  authoritative reference work).
- Add at least two tests per entry: the exact expected output, and confirmation that the fallback
  engine still works for something not in your new entry.
- If you're unsure whether an input needs a correction or is already handled correctly by the
  dictionary/legacy engine, add it to
  `docs/reference/degraded-transliteration-candidates.md` instead of guessing a fix.

## Reporting bugs

[Open a new issue](https://github.com/talmurshidi/arabname-toolkit/issues/new/choose) and pick
the template that fits:

- **Transliteration accuracy** — an incorrect Arabic conversion for a specific input. Requires
  the exact input string, the output you got, the output you expected, and a citable source for
  the expected form.
- **Bug report** — anything else that's broken.
- **Feature request** — a new capability proposal.

## Code of conduct

Be respectful and constructive. This project serves an academic research community; assume good
faith and stay focused on the scholarship and the code.
