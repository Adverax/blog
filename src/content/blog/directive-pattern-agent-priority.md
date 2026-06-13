---
title: "The directive pattern: agent priority beyond simple automations"
description: "When more than one source can give orders to the same thing, you're doing arbitration — by design or by accident. Four shapes the answer can take, how to tell which one fits your problem, and why the directive pattern wins when conflicts are constant."
pubDate: 2026-05-23
tags: ["architecture", "patterns", "agents", "decision-making"]
heroImage: ./images/directive-pattern-agent-priority.webp
heroAlt: "A small back-facing figure stands before an interior wall holding a cobalt blue notebook, looking up at three identical round control dials in a row whose indicators point in different directions — all of them aimed at a single small appliance against the wall below."
draft: true
---

Three different things wanted my battery in three different states at the same moment. The tariff scheduler wanted it charging from the grid before the evening peak. The solar optimizer wanted it discharging into household loads while there was still sun. A third process wanted it held at 95%, untouched, in case the grid dropped that night. None of them was wrong. None of them was talking to the others.

The system did the reactive thing: whichever automation fired last won.

## Arbitration, on purpose or by accident

That's not automation anymore. That's *arbitration*. And the moment you have more than one source able to issue instructions to the same thing, you're doing it whether you designed for it or not. Your choice is whether it happens on purpose, in a place you can read, or by accident in the order events arrive on a bus.

Most systems pick the second option without noticing. Last-write-wins isn't a strategy — it's the absence of one. It still produces a winner; you just don't know who it'll be until after the fact.

I argued recently that automation and control are different categories — "when X, do Y" was never built to carry decisions that depend on goals, history, and conflicting intentions. This piece is the answer to the question that one opened: if not a pile of automations, then what?

Beyond batteries and Home Assistant, the more interesting question is: when you realize you have an arbitration problem, what shape does the answer take? There are four common ones. Each has a sweet spot. The one most engineers reach for, by reflex, is rarely the one they need.

## Four shapes the answer can take

**Event-driven.** The shape most engineers know. Sources emit events; handlers react. Each handler is independent — it doesn't know about the others and doesn't need to. The system composes loosely: you can add a new source without touching existing handlers. That looseness is the point; it's what lets the model scale to many handlers cheaply.

It cracks the moment two handlers want to touch the same thing. The platform doesn't decide between them; it just runs them, in some order. If your handlers write to disjoint state, you're fine. If they write to the same state, you've got an arbitration problem dressed up as a race condition — and adding handlers makes it geometrically worse, because every new pair is a new chance for them to step on each other.

**Rule engines.** Old technology — Drools, CLIPS, the whole production-rule tradition — and a perfectly good one for what it does. You write if-then rules with explicit salience or priority. When multiple rules match, the engine picks the highest-salience one and fires it. At least the arbitration is named.

It cracks when both the rules and the priorities are moving. Adding a new rule means re-tuning the salience of three old ones to keep the right thing winning, and now you're not designing rules — you're tuning a sort key. Rule engines shine when the rule set is small, slow-changing, and the priorities are well-understood. They suffer when the world your rules describe is itself in motion.

**Scheduler-based.** Carve up time. The tariff process owns the battery from 23:00–06:00; the solar process from 09:00–17:00; the rest split between others. As long as the slots are disjoint and exhaustive, no two sources ever contend for the same moment, and the system behaves predictably.

It cracks when reality stops respecting the slots. Clouds arrive at 14:00. An outage starts at 18:30. The user manually changes a setting at 11:00. The schedule was designed for a world in steady state, and you don't have one. Out-of-band events either get ignored — the worst outcome — or special-cased, which is the start of becoming a rule engine, badly.

**The directive pattern.** Instead of letting sources mutate shared state directly, each source publishes a *directive*: a stated intention with context attached — who's asking, what they want, how long it's valid, what it overrides or yields to. The directives sit somewhere they can be seen. A single layer — call it a resolver, an arbiter, a controller; the name doesn't matter — reads the set of active directives and decides what the system actually does this moment.

Three things change. Conflicts become *visible*: you can look at the set of directives and see that two sources disagree, instead of inferring it from behavior after the fact. The resolution rule lives in one place, not scattered across a dozen handlers. And you can change the rule without touching the sources — a new source emits a new directive; the resolver decides what to do with it.

The cost is honest: you're now writing a controller. You have to decide how directives combine — by priority, by scope, by validity, by some hierarchy that makes sense in your domain. There is no free lunch; you've moved the complexity from accidental (in event order) to deliberate (in the resolver). That trade is the whole point.

I'll leave the *how* of resolution to its own discussion and to your own domain. The general advice is don't copy someone else's resolver — design the rule for the system you're actually running. The pattern is the bones. The rule is the muscle.

## Which one do you actually have?

Three questions, in order.

Do multiple sources need to influence the same shared state? If no, you don't have an arbitration problem at all, and event-driven is fine. Most of what people call "automation" lives here, and it's the right tool when it does.

Are conflicts rare, and the resolution rule small and well-understood? A rule engine with named salience will hold the line. So will a clever scheduler, if the conflicts are naturally about time.

Are conflicts constant, the sources heterogeneous, and the resolution rule itself something you'll need to inspect, test, and change as you learn? That's where the directive pattern earns its keep, and where the cheaper options stop scaling. Recognizing this *before* you're knee-deep in a rules pile saves you the months. Recognizing it *while* knee-deep is also useful — just more expensive.

## The thing automation tutorials don't teach

Look at it from one more layer up. Every system with more than one source of control eventually answers two questions: *who wins, and how was that decided?* You can answer them in code, explicitly, in one place — or you can let the runtime answer them for you by accident, in event order, every time. The directive pattern isn't magic; it's the discipline of doing the first when you discover you've been doing the second.

The reason it gets reached for late or never is that the wrong answer often looks like it works. Until it doesn't, and the bug report says "the battery did the wrong thing on Tuesday night and I don't know why." That sentence — *I don't know why* — is the marker. The system already arbitrated. You just weren't there to watch.

Most automation tutorials end at "when X, do Y." That's the part that's easy to teach, because it's the part where nothing has to decide. Everything that matters in real systems happens after that — when two X's want different Y's, and someone has to choose. Where you put the someone, and whether it's a someone at all, is the design.
