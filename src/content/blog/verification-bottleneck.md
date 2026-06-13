---
title: "The bottleneck in AI-assisted development isn't generation. It's verification."
description: "AI generates code faster than anyone can read it — but generation was never the hard part. The constraint has moved downstream, to proving the output actually holds. Why verification is the new bottleneck in AI-assisted development, and what it changes about how we build."
pubDate: 2026-06-13
tags: ["ai", "engineering", "verification", "tooling"]
heroImage: ./images/verification-bottleneck.webp
heroAlt: "A small back-facing figure crouches to look inside an open cardboard box at the near end of a row of identical sealed boxes, a cobalt-blue notebook resting on the surface beside it."
draft: false
---

> **Note on the blog.** I usually write here about energy systems in places where the grid can't be trusted — about single points of failure and the discipline of building things that hold when they're not allowed to fail. This post is about software delivery, not power. But it's the same preoccupation one layer over: a system you can trust when "it looks done" isn't good enough. So it belongs here.

There's something quietly broken in how most teams use AI assistants today.

The promise is seductive: describe what you need, the model writes the code, iterations are fast, features ship. But under the surface a structural problem accumulates. The model can't see the architectural decision made six months ago. It doesn't know which invariant the domain model protects. It can't tie a new requirement to the acceptance criterion that defines "done." It implements what you described — and you find the gap during a production incident.

I want to make a claim that runs against the current of the whole "AI writes the code" conversation:

**The value of AI in software is not that it automates typing. It's that it can automate verification.** And almost no one is building for that.

Code generation was never the bottleneck. A senior engineer who knows the domain was never blocked on typing speed. The bottleneck is trust: can you trust that the generated code satisfies the requirement? That it respects a boundary set three months ago? That the review finding blocking your merge is a real bug and not noise? Optimizing generation speed optimizes the part that was already cheap.

So I built a pipeline on the opposite premise. I call it **forge**. This post is about the idea; the rest of this paragraph is about how I'll prove it isn't vapor. forge took a single paragraph of product intent and produced a complete, tested, documented backend — domain model, architecture decisions, code, and a verification trail that ties every requirement to the test that proves it. I reviewed and approved decisions; I did not write the implementation. The result is a real repository you can read, audit, and run.

- **The proof, as a 3-minute read:** [the Turnstile presentation](https://github.com/Adverax/turnstile/blob/main/docs/presentation.html) — twelve slides from one paragraph to working code.
- **The proof, for skeptics:** [the Turnstile repository](https://github.com/adverax/turnstile) — 9k lines of Go, 19 ADRs, 237 tests, the full `meta/` decision trail. Open `holdSeatsSQL` and decide for yourself.
- **The proof, in motion:** [the pipeline run, recorded](https://youtu.be/dc2IVhJaZcw) — and, for anyone who suspects editing, [the full unedited session](https://youtu.be/LglW0bEu0N4).

The rest of this is what I learned building it, and where the line actually is.

## What "engineering" has to mean here

The word "engineering" gets used too loosely. In this context it means something specific: the system has properties that can be checked independently of human judgment, and those checks run automatically.

Most spec-driven approaches getting attention right now — Spec Kit, Kiro, and the like — put the specification back at the center of the process. That's the right direction. But there's a ceiling: in those tools the specification holds together through human consistency — better context hygiene, structured documents, review checklists. They give you no formal guarantee that the architecture still matches the code, that every requirement traces to a test, that a new change didn't silently cross a boundary set three sprints ago.

forge's bet is that the spec, the architecture, and the code should be machine-checkable against each other — and that the check should fail the build when they drift. Concretely, that shows up in five places. I'll describe what each one *does*; the presentation shows them as artifacts, and the repository lets you inspect them.

**Validation gates between phases, not vibes.** Each architectural phase emits structured artifacts; a validator checks schema, internal consistency, and coherence *across* artifacts before the next phase runs. A domain model referencing a command that doesn't exist doesn't pass. A trace matrix pointing at a code path that resolves to no file doesn't pass. This isn't a style guide — it's a gate.

There's a subtlety here worth stating plainly, because it surprised me too: in a clean run, a developer never sees a raw validator error. The inner loop catches and repairs its own malformed artifacts; what reaches *me* is a different thing — clarifying questions early, and forks recorded in a decisions log waiting for my call. The pipeline converts downstream errors into upstream questions. A raw validator error surfacing at all means the flow was bypassed — someone edited the code or the model outside the pipeline. Which is exactly the one case where you *want* a hard wall: I renamed a package by hand, out of band, and CI went red because the trace matrix glob stopped resolving. ([The drift gate is in CI](https://github.com/Adverax/turnstile/blob/main/.github/workflows/forge.yml); it runs the deterministic validators, no agent.)

**Traceability that's checked, not declared.** Every functional requirement carries an acceptance criterion; every criterion names the test that verifies it. At the gate, forge doesn't ask the agent whether the criterion is met — it runs the named test and demands green. A checkmark without evidence is a failure. This closes the "false done" gap that haunts most AI workflows: when the model says "AC met" and the test suite says otherwise, the gate resolves the conflict one way — the test suite wins.

**Findings that have to survive a challenge.** Review findings at blocking severity aren't taken on faith. Before a finding counts against the gate, an independent pass argues against it on the real diff and tries to refute it. A false positive in a blocking gate isn't noise — it blocks good work, and a review tool that cries wolf trains engineers to ignore it. So the findings have to earn their block.

**Conflicts resolved by intent, not by picking a side.** When two changes collide at merge, most tools show you the raw diff and leave you to choose. forge reads each side in context — the decision that motivated it, the requirement it was satisfying — and proposes a resolution that preserves both intents where it can. A merge conflict is a synthesis problem, not a selection problem; treating it as the latter is how intent quietly gets dropped.

**It refuses to hallucinate intent.** Pointed at an existing codebase, forge will reverse-engineer a descriptive model of what the code *does*, tagged with confidence. But the prescriptive layer — *why* a decision was made — can't be recovered from code, and it's listed as a gap to fill, never fabricated. The line between "inferred with high confidence" and "a human must supply this" is drawn explicitly. And adoption is incremental: as you curate each entry from inferred to authored, full validation switches back on for it — a brownfield codebase migrates into the pipeline piece by piece, with no big-bang documentation effort up front.

## Where I draw the open line

I'm publishing the *methodology* in the open — the phase structure, the gate philosophy, the artifact model, the worked example in full. What stays mine is the orchestration: the prompts, the agent choreography, the tuning that makes the inner loop converge. That's a deliberate open-core line, and I'll be straight about why: the moat was never the prompt text — that commoditizes in months. The moat is the engineering judgment encoded in where the gates sit and what they refuse to let through. You can see every gate in the Turnstile artifacts. How they're driven is the part I'm keeping.

If that sounds like hedging, here's the honest version: I think the *ideas* here should spread, and I think the *assembly* is worth something. Both can be true.

## What it cost, and where it still fails

A worked example that only shows the wins is marketing, not engineering. So:

The Turnstile run was roughly a four-hour agent session for a three-context backend — not a toy, but not a large system either. ([The retrospective with per-card timings is in the repo](https://github.com/Adverax/turnstile/blob/main/meta/kanban/retro.md).) A full greenfield architectural pass on a quality model profile is not cheap in API tokens; on a budget profile you trade reasoning quality for cost, and some of the value lives in the reasoning on the heavy phases.

And it still gets things wrong *inside* the gates. Two real examples from this very build, both caught in my audit rather than by the pipeline:

- It closed an implementation card whose per-buyer ticket cap counted only held seats, not paid ones — a quiet drift from the decision record — and marked the requirement covered. The gates checked that *a* test existed and passed; they didn't catch that the logic diverged from the ADR's intent.
- After an internal refactor it left the trace matrix pointing at stale test names and a renamed migration path. Coverage was real; the references were dead.

Both are now fixed, and fixing them is the point: the gates catch structural drift well and semantic drift poorly, and a human reviewer is still load-bearing exactly where judgment is required. I'd rather you know that before you decide what the system is worth.

The paradigm is also opinionated to a fault. It assumes a domain-driven worldview — bounded contexts, aggregates, domain events. For a frontend-only app, a data pipeline, or a CLI tool, large parts of the architectural half simply don't apply. forge says so itself, but it means teams whose domain doesn't fit DDD will find much of the pipeline irrelevant. And it's a Claude Code plugin with Python validators — it doesn't port to other environments for free.

## The thing I keep coming back to

Software engineering is the discipline of making systems behave predictably in spite of complexity. AI assistance doesn't dissolve that discipline. It changes the tools available to apply it — and, if you build for it, it can take over the part of the discipline that was always the most tedious and the most skipped: proving the thing actually does what you said.

The hardest part of building forge wasn't the implementation. It was resisting the urge to paper over the hard problems — to build a pipeline that *looks* rigorous, produces impressive artifacts, and lets the agent declare "done" at the end of every phase. It takes more discipline to build one where the declarations are checked, the findings are challenged, and the docs are grounded in the real code. That's the whole bet: that this is worth more than generating faster.

<!-- ============================================================
EDITORIAL NOTES — delete before publishing

LINKS TO FILL (all anchors filled):
1. Recorded pipeline run (10-min edit) — DONE: https://youtu.be/dc2IVhJaZcw
2. Full unedited session — DONE: https://youtu.be/LglW0bEu0N4
   (verify the CI workflow + retro.md links resolve on main)

DECISIONS BAKED IN PER YOUR ANSWERS:
- forge is the hero, Turnstile is the proof → forge named in lead, thesis-first,
  Turnstile demoted to three "proof" links, not a walkthrough.
- Priority = co-founder inbound → author footer is an explicit but dignified
  "founding CTO" line; thesis-led piece signals seniority better than a CV.
- Methodology open / internals closed → dedicated "Where I draw the open line"
  section makes the open-core boundary a feature, not an omission. forge repo
  stays private (confirmed 404); only Turnstile artifacts are linked.

WHY THIS IS THINNER THAN THE v2 DRAFT:
You now have a 12-slide presentation and a readable repo. The article must NOT
re-explain them — its job is the thesis and your judgment. Heavy facts (line
counts, ADR list, phase table, C4) live in the presentation; correctness proof
lives in the repo; the live process lives in the video. The article points; it
doesn't duplicate. If a paragraph here restates a slide, cut it.

PUBLISH ORDER (unchanged from our plan):
1. Blog goes live, sits quiet 1–2 days. Verify every link + both videos resolve.
2. Show HN early US-morning weekday + native LinkedIn teaser same day
   (LinkedIn: 200–300 word native post, thesis + "one evening" number, link in
   first comment, 30–60s muted concurrency-test clip uploaded NATIVELY).
3. DOU (Ukrainian version) after it settles — same canonical URL, lang toggle.

STILL TO DECIDE:
- Title: the verification thesis is the strong horse. Alt for LinkedIn:
  "I gave a paragraph to an AI pipeline. It gave back a tested backend — and a
  way to prove it." Keep the thesis title as canonical.
- The "two real failures" section is your most credible asset. Do NOT soften it
  in editing. It's what separates you from every "10x with AI" post.
============================================================ -->