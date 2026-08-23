# COMP4020 prototype (full-stack)

Your starter repo for a COMP4020 full-stack prototype: an Astro app with
server-rendered pages, a SQLite database, and a live-update channel, deployed to
Fly.io. The deployed app is what gets marked, not this repo.

The
[course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec, and this repo's name tells you
which deliverable applies. Read both before you plan or build.

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

`spec/README.md`, `PROCESS.md` and `reflections/README.md` are in this repo and
say what they are for.

## This file is yours

A starting point, not a rulebook: what you add to it is the harness, and the
harness is assessed. This file and the sensors you wire into `check` carry
across the course --- both come with you into next week's repo. The prototype
doesn't: source, and the tests answering this week's published spec, stay
behind. `spec/README.md` draws the line.
