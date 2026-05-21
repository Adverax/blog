---
title: "Why remote work forced me to build orchestrated backup power — and reject Home Assistant"
description: "Home Assistant is the best home-automation platform there is — which is exactly why it's the wrong tool for energy orchestration. A developer's case for why automation and orchestration are different problems, and why mistaking one for the other costs you months."
pubDate: 2026-05-18
tags: ["home-assistant", "energy", "architecture", "automation", "iot"]
heroImage: ./images/why-i-rejected-home-assistant-energy-orchestration.webp
heroAlt: "A small back-facing figure stands before an interior wall holding a cobalt blue notebook, between a 3×3 grid of identical light switches on the left and a single round wall-mounted thermostat on the right."
draft: true
---

The power where I live goes out on a schedule — and, lately, often off it. My wife and I both work remotely, so when the grid drops, our income drops with it. A home battery here isn't a way to trim a few percent off a bill; on a bad day it's whether two people can do their jobs at all. (Why that's existential and not merely inconvenient is its own story — a separate post.)

So I wanted that battery to be genuinely smart — deliberate about when it charged, what it kept alive, and what it let go. The obvious tool was already running in my house. Home Assistant talks to my inverter: it reads the battery's state of charge, knows the tariff windows, sees the weather forecast, and will happily flip the inverter's mode on a schedule. The path looked obvious and free — I've already got the platform, just add a few automations.

That instinct is the wrong turn. Not because Home Assistant is bad — it's the best home-automation platform there is, and I'll defend that below. The trap is subtler. It works in the demo. It keeps working right up until the night it quietly matters, and then it doesn't.

I evaluated Home Assistant seriously as the foundation for that, and rejected it. The bar it had to clear was never "can it optimize my tariff" — it was "will it still make the right call at hour six of a blackout, when it matters most and the data is worst." The reasoning generalizes well past my case.

## First, real credit

Let me be specific about what Home Assistant is genuinely great at — the rest of this only lands if you trust I'm not strawmanning it.

Nothing else comes close to its integration breadth. The thankless, endless work of speaking every vendor's dialect — the inverters, the plugs, the meters, the weather services — Home Assistant does that better than anyone, and it does it locally, without making your house depend on someone's cloud staying up. Its automation model is genuinely well-designed: trigger, condition, action. Each automation is a small, independent reflex you can read on its own and reason about in isolation. That loose composition is not a weakness; it's the reason the platform scaled to thousands of integrations and millions of homes. If what you want is "when the door opens after sunset, turn on the hallway light," there is no better tool on earth.

Energy orchestration looks like it should fit that model. It doesn't. And the gap isn't a missing feature — it's a category.

## Reflexes versus a control loop

A home automation is a reflex. Something happens, you respond. The model is reactive and, by default, stateless: each rule fires, does its thing, and forgets. The genius of that design is exactly that the rules don't need to know about each other.

Energy orchestration is not a pile of reflexes. It's a control problem. You are continuously choosing actions that move a physical system toward goals you care about, under several conditions that automations don't have to deal with: the objectives conflict with each other, the future is uncertain, some constraints must never be violated, and — this is the one that bites — the decisions are coupled across time. What you do at noon changes what you're allowed to do at seven.

Make that concrete. The question is never "when the price is low, charge the battery." The real question, at 1 p.m. on a Tuesday, sounds like this: the battery is at 54%, the forecast says cloud after 2 p.m., the expensive tariff window is 17:00–20:00, the grid has dropped two evenings this week, the water heater still needs an hour and you've already deferred it twice today — *should you spend grid money to charge now, and to what level?*

That is not a trigger waiting to fire. It's an optimization with a memory. And every word of that sentence — goals, trade-offs, a horizon, uncertainty, history — is a thing the automation model was deliberately designed *not* to carry, because carrying it is what kept reflexes from needing to know about each other.

## Where the model starts fighting you

Try to build that decision in Home Assistant anyway and you meet the resistance in stages.

**State ends up in the wrong place.** An orchestration decision needs working memory: the current goal, what you committed to an hour ago, what you deferred, the rough plan for the rest of the day. Automations don't have memory, so you manufacture it — helper booleans, helper numbers, template sensors that exist only to hold a value another automation reads. At some point you notice you are no longer configuring automations. You are hand-building a state machine out of global mutable variables, in a configuration language that was never asked to hold one, with no way to change several of them as a single consistent step.

**Conflicts get resolved by accident.** One automation wants the inverter in tariff-saving mode. Another wants it charged ahead of a likely outage. A third is protecting battery health. All three are reasonable; all three are right; they want different things at the same instant. Home Assistant has no first-class place to say "these instructions conflict — and here, deliberately, is the rule for which one wins." Whoever wrote last, by execution order, wins. Picture three people shouting different instructions at one machine. The hard part was never who shouts loudest — it's deciding that on purpose instead of by accident, and the platform gives you no place to make that decision on purpose.

**There's no concept of acting now for a reason that hasn't happened yet.** Automations fire when a condition flips. Orchestration often has to act at 1 p.m. *because* of something forecast for 7 p.m. You can fake a planning horizon with scheduled re-evaluations and ever-cleverer templates, but at that point you're emulating a planner on top of an event bus, badly, and you know it.

None of these are bugs. They're the automation model being exactly what it was designed to be, used for something it was designed not to be.

## The failure that decided it

Here's the one that ended the discussion for me.

Reactive automation degrades in the worst possible direction for energy. The moment the grid drops — and the internet usually goes with it — is precisely the moment your energy decisions matter most. It is *also* the moment your cloud-backed tariff data goes stale, your forecast feed goes dark, and half your sensors start lying or going silent. A reactive web responds to whatever inputs it has. Feed it missing and stale data at the exact moment the stakes peak, and it will keep firing, confidently, on garbage.

A missed home automation is an annoyance: the light didn't come on, you flip the switch. A missed orchestration decision during a blackout is the product failing at the one job it exists to do — the dashboard says 100% while the battery is flat, the load you should have shed is still running, the charge you should have banked never happened. The intelligence has to be at its sharpest exactly when the environment is at its worst. Reactive automation is structurally weakest exactly then. Those two sentences point in opposite directions, and no amount of additional automations bends them back together.

That's the moment I stopped trying to make Home Assistant do this. Not after three weeks of fighting template sensors — I want to be honest, I didn't burn weeks on it — but earlier, on the architecture, for a duller reason. Every time I tried to describe the problem to myself, the description came out as "a controller that holds goals and makes trade-offs over time on bad information." Nothing in that sentence is an automation. The wrong turn was conceptual, and it's the one almost everyone takes, because Home Assistant already reads your inverter and so "just add automations" feels free. It isn't free. It's deferred, and the bill comes due in the dark.

## The question to ask before you build

Forget Home Assistant for a second, because this isn't really about Home Assistant. Before you build anything that makes decisions, ask which of these you actually have:

A set of **reflexes** — independent, stateless, "when X, do Y," where a miss is an annoyance. Or a **control loop** — decisions coupled over time, stateful, goal-directed, hemmed in by hard constraints, where a miss is the entire point.

Automation platforms are superb at the first and quietly disastrous at the second. Energy is the second wearing the first's clothes, which is why the mistake is so easy and so common. It is not the only problem like that. Any time you feel the pull to grow a rules pile into a decision system — alerting, trading, scheduling, anything with goals and consequences — you are making this exact bet, usually without noticing you placed it.

The mistake is never choosing Home Assistant. The mistake is not noticing which problem you have until you're three hundred helpers deep and the thing has just made a confident, wrong call at 2 a.m.

So I went a different way, with different priorities — chiefly that the thing has to be at its smartest exactly when everything else has gone dark. What that is, is for another post.

Home Assistant didn't fail me. It told me, early and clearly, what kind of problem I didn't have. Build the reflexes there — genuinely, it's the best place for them. Build the controller somewhere it can keep thinking after the lights go out.
