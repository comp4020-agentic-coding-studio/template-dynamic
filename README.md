# COMP4020 full-stack prototype template

A starter template for full-stack prototypes in **COMP4020 / COMP8020 Agentic
Coding Studio**: server-rendered pages, a SQLite database on a persistent
volume, and a live-update channel, deployed to Fly.io. Click **Use this
template** to create your own repo (the course tooling usually does this for
you) and build your prototype.

## Deployment is already wired

Your repo comes provisioned with a Fly.io app named after the repo and a deploy
token installed as a repo secret. Once your repo is public, every push to `main`
runs the checks, deploys, and verifies the live URL --- which is always
`https://<repo-name>.fly.dev`. You never handle a credential, and you don't need
a Fly.io account of your own; `flyctl` is only for looking at the running app
(`flyctl logs -a <repo-name>`, `flyctl status -a <repo-name>`).

## Quick start

```sh
pnpm install
pnpm dev        # local dev server
pnpm check      # run the same checks CI runs
pnpm build      # produce dist/ (what the Dockerfile runs)
```

## What's here

- `src/pages/`, `src/lib/` --- a minimal guestbook: a form writes to SQLite
  (`src/lib/db.ts`), and new messages reach every open tab over server-sent
  events (`src/pages/api/events.ts`). It demonstrates the two things the
  full-stack half keeps asking for --- state that survives a reload, and a live
  channel --- and it's yours to replace.
- `spec/` --- what the checks are for (`README.md`), the shipped invariants
  (`invariants.test.ts`, including the accessibility floor), the route list they
  cover (`routes.ts`), and a worked example of spec tests (`guestbook.test.ts`);
  your own spec tests live alongside them.
- `CLAUDE.md` --- orients your coding agent: what the checks mean and how to
  work here. Yours to grow.
- `PROCESS.md` --- a template for your process overview, showing the
  cited-moment format. Replace it with your own; `pnpm check:evidence` verifies
  your citations resolve.
- `.github/workflows/checks.yml`, `fly.toml`, `Dockerfile` --- the fixed deploy
  artefacts: the CI sensors and deploy, the pinned Fly.io resources, and the
  image the app ships as.
- `.githooks/pre-commit` --- blocks any commit that contains something shaped
  like an API key, so your COMP4020 key can't end up in a public repo. Installed
  automatically by `pnpm install`.

The stack (Astro + better-sqlite3, in TypeScript) is a default, not a rule: the
deploy is a Docker-image build, so a stack swap lands in the `Dockerfile` and
the `package.json` scripts while CI and fly.toml stay fixed. See `CLAUDE.md` for
the exact contract.

See the course site for how the checks map to each week of the course.
