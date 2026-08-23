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
  element overlap — are disabled. It's a floor, not a clean bill of health:
  wiring up fuller accessibility testing (axe in a real browser, or
  `agent-browser` against the live page) is your work when the spec asks for it.

## A worked example (yours to replace)

`starter.test.ts` and `guestbook.test.ts` show the shape of spec tests: the
first checks the starter page's intro hook, while the second asserts the demo
guestbook's two contracts — a message survives a reload, and it reaches other
clients live over the SSE stream — by driving the running app over HTTP.
Behaviour, not implementation: tests written this way survive a change of
approach, or of stack. When you replace the guestbook with your own prototype,
replace these files with tests for this deliverable's spec. They're worked
examples, not part of the always-on contract — delete them once your spec tests
cover their ground; only `invariants.test.ts` is the suite you keep.

## Your spec tests (yours to write)

Turning the week's published spec into tests is your work, not the template's.
Some spec lines are mechanically checkable — assert those here, in your own test
file alongside the invariants (any `spec/*.test.ts` runs with `pnpm check`).
Some lines only a person can judge; leave those to the crit. Write tests for the
**contracts** — what the app must do, not how you built it — so the tests
survive a change of approach, or of stack.

Two kinds end up in here, and they have different lifespans:

- **contract tests** answer this week's published spec — that a trace survives a
  reload, that the dashboard shows live traffic. They retire with the brief they
  answer, so they stay behind when the week does.
- **sensors** assert a standard you hold the agent to whatever the brief is: no
  secret read outside the config module, every route covered in `routes.ts`,
  nothing left logging to the console in shipped output. A sensor is harness,
  the same as a rule in `CLAUDE.md`, so it comes with you into next week's repo
  — including the ones you brought over from the static half, wherever they
  still apply. Catching a recurring failure once and wiring it into `check` is
  the skilled move; re-prompting until it passes is the routine one.

By the end of semester the sensors you've accumulated are the clearest record
you have of what you've taught yourself to check for — worth citing in
`PROCESS.md` the week each one lands.

A green suite here is backpressure, not a mark: your tutor verifies the live app
against the published spec at the crit, and keeping your own tests green is how
you arrive with no surprises.
