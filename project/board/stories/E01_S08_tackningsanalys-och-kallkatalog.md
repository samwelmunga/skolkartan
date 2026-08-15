---
id: E01_S08
title: Täckningsanalys och genererad källkatalog
status: Pending
epic_id: E01
date_created: 2026-08-15
date_started: null
date_completed: null
tasks: []
depends_on:
  - E01_S01
  - E01_S02
  - E01_S03
  - E01_S04
  - E01_S05
  - E01_S06
  - E01_S07
docs: ["docs/kallor.md"]
---

# Story: Täckningsanalys och genererad källkatalog

**ID**: E01_S08
**Epic**: E01 — Data Source Catalogue
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 3 — needs every probe verdict from S02–S07.

## User Story

As the maintainer of Skolkartan, I want a generated källkatalog and an honest coverage analysis per
delfråga, so that I can see before building anything which of the project's questions the
available sources can actually answer — and which they cannot.

## Description

This story closes the Epic. It turns eight stories of probing into two artefacts: a reference
document and a verdict.

### The generated catalogue

`docs/kallor.md` is **generated from the YAML registry and never hand-written.** A hand-maintained
catalogue drifts from the registry within weeks and then quietly lies. The generator is the only
thing permitted to write that file, and CI must fail if the committed file does not match what the
generator produces from the current registry.

### The coverage analysis

Coverage is reported **per delfråga** — all eleven, individually. A source count is not coverage;
"three sources touch this area" says nothing about whether the question can be answered.

**Kärnfrågor and stödfrågor are reported separately, with no blended headline number.** This is
the point of the whole analysis. Tiers 1 and 2 are expected to score well on the five stödfrågor —
population, cost per pupil, behörighet, baseline provision, kommun context — because that is what
national statistics are good at. If those scores are averaged in with the six kärnfrågor, the
headline says the project is well covered while every question it exists to answer is unanswered.
The band split comes from the delfråga definitions in S01 as data, so the two bands cannot be
merged by accident.

### The verdict

For each of the six kärnfrågor, name the source that answers it or state plainly that none found
does, and say what follows. An honest "no open source answers `df_malgrupp`; it requires N
kommun-hours of tier 3 work per kommun" is the most valuable output this Epic can produce.

## Acceptance Criteria

- [ ] A generator produces `docs/kallor.md` from the YAML files in `project/data/kallor/`.
- [ ] `docs/kallor.md` carries a visible generated-file banner naming the generator and warning
      against hand-editing.
- [ ] CI fails if the committed `docs/kallor.md` differs from freshly generated output.
- [ ] The catalogue lists every source with its `tier`, `atkomst`, `status`, `licens`,
      `uppdateringsfrekvens`, `besvarar_delfragor`, `kanda_begransningar` and
      `senast_kontrollerad`.
- [ ] Sources are grouped so `verifierad`, `kandidat`, `avvisad` and `utgangen` are visually
      distinct; candidates are never presented as available data.
- [ ] Coverage is stated **per delfråga**, for all eleven, naming the specific sources that
      answer each.
- [ ] **Kärnfrågor and stödfrågor are reported as two separate bands**, each with its own figures.
- [ ] No single blended coverage number across both bands is published anywhere in the output.
- [ ] Only `verifierad` sources count towards coverage; `kandidat` sources are shown separately as
      potential, never as achieved.
- [ ] Each of the six kärnfrågor has an explicit written verdict — which source answers it, or a
      statement that none does.
- [ ] The tier 3 kommun-hour totals from S07 appear alongside any kärnfråga that depends on tier 3.

## Definition of Done

- [ ] All acceptance criteria are met and CI passes.
- [ ] `docs/kallor.md` is committed, generated, and demonstrably regenerates identically.
- [ ] The coverage analysis names at least one thing the project **cannot** currently answer, or
      justifies in writing why nothing is missing — a report with no gaps is treated as a report
      that was not read critically.
- [ ] The findings are stated as concrete inputs to the Epics that follow: what E02 must model,
      what E03 and E04 can build against, and how much tier 3 work E05 is really facing.
- [ ] The E01 → E09 handoff is recorded: `npm run probe:kallor` and `senast_kontrollerad` are
      named as what E09 inherits for källkatalog staleness monitoring, and E01 is explicitly
      released from ongoing freshness duty by that handoff.
- [ ] `PROJECT_SUMMARY.md` is updated by the scrum-master with the coverage verdict if it changes
      the project's scope or feasibility.
- [ ] No connector, scheduler or database code is added by this story.
