# The spec

Every deliverable's spec — what the markers consider when they judge whether
your work matches what was required — is published on the course website, and
this repo's name tells you which one applies: the course API maps repo prefixes
to deliverables, and the `start` course skill walks your agent through pulling
the right one. The brief poses the problem; the spec is the fixed contract. Read
both on the site before you plan or build.

The checks in this directory come in three kinds:

## Invariants (shipped, always on)

`invariants.test.ts` asserts things that are true of any good web app, however
you build it and whatever the week's brief asks: a navigation landmark, exactly
one top-level heading, a document language, a real title, a mobile viewport, alt
text on images — plus an automated **accessibility floor**: axe-core's rule set,
run on each page's served HTML. They run against the **running** app —
`global-setup.ts` boots the built server (`dist/server/entry.mjs`, the same
artefact production runs) with a throwaway database — so they check what
actually ships. Keep them green; don't delete them.

Two things to know about how they see your app:

- **They only visit the routes in `routes.ts`.** A server-rendered app has no
  `dist/*.html` files to walk, so the covered routes are an explicit list. When
  you add a page, add its route — otherwise the invariants silently stop
  covering it.
- **The axe pass runs without a browser** (in jsdom), which keeps CI fast and
  dependency-light but means rules needing real rendering — colour contrast,
  element overlap — are disabled. It's a floor, not a clean bill of health.

## The starter's plumbing (shipped, retires with the starter)

`guestbook.test.ts` drives the running app over HTTP to prove the supplied
plumbing works in this repo: a message survives a reload, and a new one reaches
other clients over the SSE stream. A red run on a fresh clone means the platform
is broken, not your work. It describes the starter, so it goes when the starter
does.

## Your spec tests (yours to write)

Turning the week's published spec into tests is your work, not the template's.
Some spec lines are mechanically checkable — assert those here, in your own test
file alongside the supplied ones (any `spec/*.test.ts` runs with `pnpm check`).
Some lines only a person can judge; leave those to the crit. There is no minimum
count: select the checks that protect your work's real promises, and test the
**contracts** — what the page must do, not how you built it — so the tests
survive a change of approach, or of stack.

Two kinds end up in here, and they have different lifespans:

- **contract tests** answer this week's published spec. They retire with the
  brief they answer, so they stay behind when the week does.
- **sensors** assert a standard you hold the agent to whatever the brief is. A
  sensor is harness, the same as a rule in `CLAUDE.md`, so it comes with you
  into next week's repo. Catching a recurring failure once and wiring it into
  `check` is the skilled move; re-prompting until it passes is the routine one.

By the end of semester the sensors you've accumulated are the clearest record
you have of what you've taught yourself to check for — worth citing in
`PROCESS.md` the week each one lands.

A green suite here is backpressure, not a mark: your tutor verifies what you
deployed against the published spec at the crit, and keeping your own tests
green is how you arrive with no surprises.
