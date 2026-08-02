# COMP4020 full-stack prototype template

A starter template for full-stack prototypes in **COMP4020 / COMP8020 Agentic
Coding Studio**: server-rendered pages, a SQLite database on a persistent
volume, and a live-update channel, deployed to Fly.io. The course provisions a
repo from this template for each deliverable --- you don't create it yourself (a
repo you make by hand has no Fly.io app or deploy token). The `start` course
skill clones it for you; from there, build your prototype.

## Deployment is already wired

Your repo comes provisioned with a Fly.io app named after the repo and a deploy
token installed as a repo secret. Once your repo is public, every push to `main`
runs the checks, deploys, and verifies the live URL --- which is always
`https://<repo-name>.fly.dev`. You never handle a credential; `flyctl` is only
for looking at the running app (`flyctl logs -a <repo-name>`,
`flyctl status -a <repo-name>`). To use it,
[install flyctl](https://fly.io/docs/flyctl/install/) and `flyctl auth login`
with the account the course invited into its Fly.io organisation --- see the
course site's software and platforms page. (If CI itself is stuck, `fly.toml`'s
comments document a manual-deploy escape hatch.)

## Quick start

```sh
mise install       # supported path: install the template's Node and pnpm
pnpm install
pnpm dev             # local dev server
pnpm check           # most of what CI runs (links, secrets and deploy are CI-only)
pnpm check:evidence  # the process-evidence gate CI also runs before deploy
pnpm build           # produce dist/ (what the Dockerfile runs)
```

`mise` is the course's recommended runtime manager. If you use another manager
or the official installers, that is fine: provide the Node and pnpm versions in
`mise.toml`, then run the same commands. Tutor support reproduces runtime
problems with mise.

## What's here

- `src/pages/`, `src/lib/` --- a minimal guestbook: a form writes to SQLite
  (`src/lib/db.ts`), and new messages reach every open tab over server-sent
  events (`src/pages/api/events.ts`). It demonstrates the two things the
  full-stack half keeps asking for --- state that survives a reload, and a live
  channel --- and it's yours to replace.
- `mise.toml` --- the tested Node and pnpm versions for this template.
- `src/lib/schema.ts` + `drizzle/` --- the database schema (Drizzle) and its
  migrations. Edit the schema, run `pnpm db:generate`, commit the migration; it
  applies automatically when the server boots, locally and deployed.
- `spec/` --- what the checks are for (`README.md`), the shipped invariants
  (`invariants.test.ts`), the route list they cover (`routes.ts`), and worked
  examples of page and behaviour tests (`starter.test.ts`, `guestbook.test.ts`);
  the spec tests you write live alongside them.
- An accessibility floor on every SSR page --- `invariants.test.ts` runs
  axe-core against each route in `routes.ts`. It's a floor, not a clean bill of
  health (see `spec/README.md`), and it's a check the static template doesn't
  ship out of the box.
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

The stack (Astro + SQLite via Drizzle, in TypeScript) is a default, not a rule:
the deploy is a Docker-image build, so a stack swap lands in the `Dockerfile`
and the `package.json` scripts while CI and fly.toml stay fixed. See `CLAUDE.md`
for the exact contract.

See the course site for how the checks map to each week of the course.
