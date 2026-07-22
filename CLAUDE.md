# COMP4020 prototype (full-stack)

This is your starter repo for a COMP4020 full-stack prototype: an Astro app with
server-rendered pages, a SQLite database, and a live-update channel, deployed to
Fly.io. The **deployed app is what gets marked** --- not this repo, and not "it
works on my machine". It's marked live in Chrome against the deployed URL at two
viewports --- 1920×1080 (desktop) and 390×844 (phone) --- and both count in
full, so make that artefact good at both and use the checks below to know
whether it is. For the full rubric and what your repo needs to hold, see the
course site's
[assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/)
rather than reading it back out of this file.

What you're building this week — the spec — is published on the course website,
and this repo's name tells you which deliverable it is. Run the course plugin's
**new-week** skill at the start of each week: it pulls the right spec from the
course API, carries your harness forward from last week, and helps you turn the
spec's checkable lines into tests of your own. Read the spec before you build,
and see `spec/README.md` for how the checks in this repo relate to it.

## How to work in here

- Keep the dev server running (`pnpm dev`) so you see changes as you make them.
- Before you push, run `pnpm check`. It runs most of what CI runs --- build,
  lint, and the spec --- so you catch those in seconds instead of waiting for
  the pipeline. Run `pnpm check:evidence` too before you ship --- it's the same
  gate CI runs before deploy, so failing it locally is cheaper than failing it
  there. The secrets, deploy, and links checks only run in CI.
- To see what the page actually looks like rather than what you assume it looks
  like, open it with `agent-browser`. The rendered page is the truth; your
  mental model of it isn't.
- When a check fails, read its output before changing anything. Each check below
  names what it measures, and the failure message is the instruction: it tells
  you the file, the line, or the contract. Treat a red check as authoritative
  --- the app is wrong until the check is green, not until you decide it should
  be.
- Commit when the checks pass. Never commit a red state.

## The checks (your sensors)

CI runs these on every push once your repo is public, reporting each one
separately. While the repo is private (all week, until you ship) the CI jobs
stay skipped --- `pnpm check` is the same roster on your machine, and it's the
faster loop anyway. They aren't hoops. Each is a different way of finding out
something true about the app that you can't reliably see by looking at it.

- **build** --- the app must build (`pnpm build`). A build failure means the
  deployed app is broken or stale, so nothing else matters until this is green.
- **deploy / online** --- CI deploys to Fly.io on every push to `main` once the
  repo is public, then checks the live URL returns 200 **and** that the
  live-update stream is streaming. You never handle a deploy credential: the
  token is a repo secret installed at provisioning, and the app name is your
  repo's name, so your URL of record is `https://<repo-name>.fly.dev`.
- **spec** --- `spec/invariants.test.ts` boots the built server and asserts
  what's true of any good web app, whatever the week's brief asks --- including
  an automated accessibility floor (axe-core; see `spec/README.md` for what it
  can and can't see). The tests you write for the week's own spec run alongside
  it (any `spec/*.test.ts`). A failure names the contract you haven't met yet.
- **lint** --- `stylelint` for CSS, `oxlint` for TypeScript. Flags code that's
  wrong, fragile, or non-idiomatic. Read the rule it names.
- **tests** --- any tests you write must pass. A failing test is a claim about
  the app that's no longer true.
- **evidence** --- `pnpm check:evidence` checks the process-evidence bundle
  PROCESS.md promises: your commit citations resolve to real commits, a
  reflection entry exists in `reflections/`, and `CLAUDE.md` is present. It's a
  separate CI step that gates deploy --- see PROCESS.md and the course site's
  [assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/)
  for what the bundle needs to hold.
- **links** --- internal links must resolve **on the live site**: it's the
  deploy job's last step, run against the deployed URL after the deploy itself
  succeeds. A broken link is a dead end you didn't mean to ship --- and because
  it only runs post-deploy, a red deploy means this check never ran at all, not
  that your links are fine.
- **secrets** --- the repo is scanned for committed credentials. Never put a
  key, token, or password in a tracked file. If one leaks, rotate it. A local
  pre-commit hook (`.githooks/pre-commit`, installed by `pnpm install`) also
  blocks any commit containing something shaped like an API key --- by the time
  CI sees a key it's already pushed, so the hook is the sensor that matters.

The axe pass is a **floor**, not the ceiling: it runs without a browser, so the
rules that need real rendering (colour contrast, overlap) are off. Checking
those --- axe in a real browser, `agent-browser` against the live page --- and
everything about **performance** is still your work, and later in the course the
spec will ask you to show how you tested both. When you do, read a green
performance result honestly: it's a lab estimate from one run on a CI machine,
not proof the app is fast for real users.

## Where your data lives

The app's whole persistent state is one SQLite file. Locally that's
`.data/app.db` (untracked --- your test data stays yours); deployed, fly.toml
points it at `/data/app.db` on the machine's volume, which is how state survives
a reload, a machine restart, and a redeploy. There is exactly **one** machine
and **one** volume --- that's pinned in fly.toml and the CI deploy
(`--ha=false`), and the in-process SSE bus in `src/lib/events.ts` depends on it
--- so don't scale out without rethinking both. You don't create that volume
yourself: `[mounts]`'s `initial_size` in fly.toml is there so `fly deploy` can
create the volume on the first deploy that finds none, so it just exists by the
time the app needs it.

The database is managed with Drizzle: `src/lib/schema.ts` is the ground truth,
and schema changes travel as migrations. Because the deployed state outlives
every deploy, "just change the CREATE TABLE" doesn't work --- the flow is edit
`schema.ts`, run `pnpm db:generate`, and commit the migration it writes to
`drizzle/`; the server applies pending migrations at boot (the recommended shape
for SQLite on Fly), so the same commit that changes the code also upgrades the
live database. Never edit the schema by hand in the database.

The live channel is server-sent events (SSE): `src/pages/api/events.ts` is the
stream, `src/lib/events.ts` is the in-process bus that feeds it, and the inline
script in `src/pages/index.astro` is the consuming end. That's the paved path to
the final project's live-update requirement --- keep the pattern even if you
replace everything around it.

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

## Your process is part of the mark

The deployed app is only half of it. How you got there is marked too: your
commit history, your agent files, and the decisions visible across them. The
checks above can't see any of that, so a person reads it directly --- which
means building legibly is part of building well.

- **Commit as you go.** Small, frequent commits are the record of how the work
  came together, and that record is read, not just the final state. A trail that
  grew alongside the code is the strongest evidence of your process; a single
  dump the night before is the weakest.
- **Keep a process overview** (`PROCESS.md`). A short reading-guide, not an
  essay: what you built, the moments that mattered --- each pointing at a
  commit, a `CLAUDE.md` change, or a prompt and the commit it produced --- and
  where to look in the history. It points a marker at the evidence; it doesn't
  stand in for it, and claims the history doesn't back don't count. The
  `PROCESS.md` in this repo is a template showing the shape and the citation
  format (link text the commit hash or range, target the commit or compare URL);
  `pnpm check:evidence` verifies your citations resolve to real commits before
  you ship. Markers follow those citations and don't trawl the repo for evidence
  you didn't cite.
- **Write your weekly reflection in `reflections/`** --- a short markdown file
  in this repo, one per week, answering the two standing prompts: what this
  week's work changed about the developer you want to be, and the aha moment
  that moved the work forward. It stays out of the deployed app. It's due at the
  cutoff, and it's the written half of your crit contribution.
- **This file is process evidence.** The harness you build to direct the agent,
  this `CLAUDE.md` and any `AGENTS.md`, is itself read as part of how you
  worked. Keep it honest and current (see below).

You don't need a name, a student number, or any identity file in the repo: we
know whose repo it is. Spend the effort on the work.

## This file is yours

This CLAUDE.md is a starting point, not a fixed rulebook. As you learn what your
prototype needs --- a convention to hold the agent to, a sensor that keeps
catching you out, a fact about the stack the agent keeps getting wrong --- write
it down here. Growing this file is the work of harness engineering, and the gap
between this boilerplate and your own version is part of what your prototype
says about the developer you're becoming.
