# COMP4020 full-stack prototype template

A starter template for full-stack prototypes in **COMP4020 / COMP8020 Agentic
Coding Studio**: server-rendered pages, a SQLite database on a persistent
volume, and a live-update channel, deployed to Fly.io. The course provisions a
repo from this template for each deliverable --- you don't create it yourself (a
repo you make by hand has no Fly.io app or deploy token). The `start` course
skill clones it for you; from there, build your prototype.

This file documents what the repo ships and what it fixes: the deploy artefacts,
where the data lives, and the contract a stack swap has to keep. Everything else
is yours, `CLAUDE.md` included --- it arrives empty.

## Your brief and spec

The
[course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec, and this repo's name tells you
which deliverable applies. Read both before you plan or build. The deployed app
is what gets marked, not this repo.

## Deployment is already wired

Your repo comes provisioned with a Fly.io app named after the repo and a deploy
token installed as a repo secret. Once your repo is public, every push to `main`
runs the checks, deploys, and verifies the live URL --- which is always
`https://<repo-name>.fly.dev`. You never handle the deploy credential; `flyctl`
is for looking at the running app (`flyctl logs -a <repo-name>`,
`flyctl status -a <repo-name>`). To use it,
[install flyctl](https://fly.io/docs/flyctl/install/) and put the token the
course sent you for this app in your shell as `FLY_API_TOKEN` --- no Fly.io
account needed; see the course site's software and platforms page. (If CI itself
is stuck, `fly.toml`'s comments document a manual-deploy escape hatch.)

## Quick start

```sh
mise install       # supported path: install the template's Node and pnpm
pnpm install
pnpm dev             # local dev server
pnpm check           # most of what CI runs (links, secrets and deploy are CI-only)
pnpm check:evidence  # the process-evidence gate CI also runs before deploy
pnpm build           # produce dist/ (what the Dockerfile runs)
```

`mise` is what tutor support reproduces runtime problems with; any other manager
is fine if you match the Node and pnpm versions in `mise.toml`.

## What's here

- `src/pages/`, `src/lib/` --- a minimal guestbook: a form writes to SQLite
  (`src/lib/db.ts`), and new messages reach every open tab over server-sent
  events (`src/pages/api/events.ts`). It demonstrates the two things the
  full-stack half keeps asking for --- state that survives a reload, and a live
  channel.
- `src/lib/schema.ts` + `drizzle/` --- the database schema (Drizzle) and its
  migrations.
- `spec/` --- the shipped invariants (`invariants.test.ts`), the route list they
  cover (`routes.ts`), and the starter's plumbing check (`guestbook.test.ts`);
  the spec tests you write live alongside them.
- `.github/workflows/checks.yml`, `fly.toml`, `Dockerfile` --- the fixed deploy
  artefacts: the CI sensors and deploy, the pinned Fly.io resources, and the
  image the app ships as.
- `.githooks/pre-commit` --- blocks any commit that contains something shaped
  like an API key, so your COMP4020 key can't end up in a public repo. Installed
  automatically by `pnpm install`.
- `PROCESS.md`, `spec/README.md` and `reflections/README.md` --- each says what
  it is for. `CLAUDE.md` is your harness, and it stays empty until you write it.

## Where your data lives

The app's whole persistent state is one SQLite file: locally `.data/app.db`
(untracked), deployed `/data/app.db` on the machine's volume, which is how state
survives a reload, a restart, and a redeploy. There is exactly **one** machine
and **one** volume --- pinned in fly.toml and the CI deploy (`--ha=false`), and
the in-process SSE bus in `src/lib/events.ts` depends on it --- so don't scale
out without rethinking both.

Schema changes travel as migrations: edit `src/lib/schema.ts`, run
`pnpm db:generate`, and commit the migration it writes to `drizzle/`. The server
applies pending migrations at boot, so the same commit that changes the code
also upgrades the live database. Never edit the deployed database by hand.

The live channel is server-sent events: `src/pages/api/events.ts` is the stream,
`src/lib/events.ts` is the bus that feeds it, and the inline script in
`src/pages/index.astro` is the consuming end. That's the paved path to the final
project's live-update requirement --- keep the pattern even if you replace
everything around it.

## The stack is swappable

Out of the box this is Astro (server output, node adapter) with SQLite via
Drizzle, in TypeScript. That's a default, not a rule (unless the week's spec
says otherwise). You can swap in any stack that serves HTTP, because the deploy
is a Docker-image build and nothing in CI names a framework --- the whole
contract is:

- the **fixed artefacts** stay fixed: `.github/workflows/checks.yml`,
  `fly.toml`, and the `Dockerfile`'s role as the deploy artefact. A stack swap
  lands in the Dockerfile (and the `package.json` scripts it calls), never in
  the CI workflow or fly.toml
- the `package.json` scripts (`check`, `check:evidence`, `build`) keep working
- the app serves on the port fly.toml declares (4321), reads `DATABASE_PATH` for
  its state, and still passes the invariants in `spec/` --- including
  `spec/routes.ts`, the list of routes the invariants cover. A swap that forgets
  the route list silently shrinks the invariants to nothing, which is worse than
  failing
- the deployed app agrees it is serving **https**, and still refuses cross-site
  form POSTs. Fly terminates TLS at its proxy, so your server sees plain HTTP
  and has to be told to trust `x-forwarded-proto` (Astro does it with
  `security.allowedDomains`; every framework spells it differently, and some
  ship no CSRF check at all). Get this wrong and every form works on localhost
  and 403s in production --- which is why CI probes it after each deploy rather
  than leaving you to find out

And commit the updated `pnpm-lock.yaml`: CI installs with `--frozen-lockfile`.

## The checks

`pnpm check` runs them, and `pnpm check:evidence` is the extra gate before you
ship. CI runs the same plus secrets, then after each deploy probes the live app:
online, the SSE stream streaming, https and CSRF sane, internal links resolving.

See the course site for how the checks map to each week of the course.
