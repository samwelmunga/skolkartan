---
id: E01_S07
title: Tier 3 — åtkomstbedömning
status: Pending
epic_id: E01
date_created: 2026-08-15
date_started: null
date_completed: null
tasks: []
depends_on:
  - E01_S01
---

# Story: Tier 3 — åtkomstbedömning

**ID**: E01_S07
**Epic**: E01 — Data Source Catalogue
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 2 — the long pole. **Starts alongside the probes, not after them.**

## User Story

As the maintainer of Skolkartan, I want each tier 3 route assessed for what it actually yields and
what it costs in kommun-hours, so that the hand-curated layer in E05 is planned against measured
effort rather than optimism.

## Description

Tier 3 is where the kärnfrågor live. No open API is expected to tell us which resursskolor exist,
which målgrupp each serves, how many places they have, or what a kommun's policy is on building
versus buying. That comes from Skolinspektionens beslut, nämndprotokoll, lokala styrdokument and
kommun websites — read by a human.

This story does **not** collect the data. It assesses the **routes**: for each one, can it be
obtained at all, does it actually contain what we need, and how long does one kommun take?

### Why this starts in wave 2

A begäran om allmän handling has a response time measured in weeks. Sequencing this story after
the API probes would idle the project waiting for post. It starts with them and finishes when it
finishes — it is the long pole and should be treated as one.

### Skolinspektionen is first

**Skolinspektionen is the first and highest-priority task in this story.** Fristående resursskolor
operate under a godkännande from Skolinspektionen, and if those beslut name the målgrupp, then
`df_malgrupp` — a kärnfråga that no API is expected to answer — has a documented, repeatable
national route. That single finding would reshape E05's plan more than anything else in this Epic.

So the first question answered is: **do fristående-godkännande beslut name the målgrupp?** Answer
it before assessing any other route.

### Routes to assess after Skolinspektionen

Kommunala nämndprotokoll and diarium; lokala styrdokument and skolplaner; kommun websites'
resursskola pages; samverkansavtal between kommuner; direct begäran om allmän handling where
nothing is published.

### Recording model

Per the S01 contract, **tier 3 entries register routes, not documents**. Each route gets a
`kalla` entry with an `atkomstbedomning` carrying an effort estimate **in kommun-hours** — the
hours to work that route for one kommun — so E05 can multiply by nine and plan honestly.

## Acceptance Criteria

- [ ] The Skolinspektionen route is assessed first, before any other route.
- [ ] A written verdict on whether fristående-godkännande beslut name the målgrupp, evidenced by
      at least one real beslut for an in-scope kommun, committed as a fixture.
- [ ] Whether those beslut are searchable by kommun, and how, is recorded in `anrop`.
- [ ] Each tier 3 route has a file under `project/data/kallor/` with `tier: 3` that passes
      `npm run validate:kallor`.
- [ ] Every tier 3 entry carries an `atkomstbedomning` with an effort estimate **in kommun-hours**.
- [ ] Each estimate is grounded in an actual attempt on at least one real kommun, not guessed.
- [ ] Each route records which delfrågor it can answer, weighted towards the six kärnfrågor.
- [ ] Routes are registered as repeatable routes, not as lists of individual documents.
- [ ] Where a route requires a formal begäran om allmän handling, that is recorded together with
      the observed or expected response time.

## Definition of Done

- [ ] All acceptance criteria are met and CI passes.
- [ ] The Skolinspektionen målgrupp verdict is written down unambiguously, and its consequence for
      E05 is stated whichever way it falls.
- [ ] A total effort estimate for the tier 3 layer across all nine in-scope kommuner is derived
      from the per-route kommun-hour figures.
- [ ] Any kärnfråga that no tier 3 route can answer either is flagged to S08 as an unanswerable
      question, with the honest consequence for the project written down.
- [ ] Kommunal routes are assessed for at least two contrasting kommuner — one large, one small —
      since Malmö and Höör will not behave the same way.
- [ ] Any route found to be blocked, refused or unreasonably costly is recorded with
      `status: avvisad` and an `avvisad_orsak`, rather than quietly dropped.
- [ ] No curated data is collected and no connector is built by this story.

## Prerequisites

**User action may be required.** Some routes cannot be assessed by an agent alone:

- **Begäran om allmän handling** — submitting a formal request to a kommun or to Skolinspektionen
  requires a named human sender and a reply address. If a route needs one, the user must send it.
- **Response lead time** — replies can take weeks. Treat this story as blocked-in-part rather than
  failed while awaiting a reply, and record the date sent.
- **Any portal requiring registration** — if a diarium or beslutsdatabas requires an account, the
  user must create it and supply access.
