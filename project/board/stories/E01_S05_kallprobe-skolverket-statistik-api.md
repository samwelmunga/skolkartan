---
id: E01_S05
title: "Källprobe: Skolverkets statistik-API"
status: Pending
epic_id: E01
date_created: 2026-08-15
date_started: null
date_completed: null
tasks: []
depends_on:
  - E01_S01
---

# Story: Källprobe: Skolverkets statistik-API

**ID**: E01_S05
**Epic**: E01 — Data Source Catalogue
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 2 — runs in parallel with S02–S04, S06, S07.

## User Story

As the maintainer of Skolkartan, I want Skolverkets statistik-API probed at school-unit level, so
that I know which per-school measures are actually retrievable — and, just as importantly, which
are withheld under statistiksekretess for the small units this project cares most about.

## Description

This is the source that takes the project from kommun-level comparison down to individual school
level: behörighet, betyg, personaltäthet and resource measures per skolenhet. Tier 2, open.

There is a structural problem this probe must confront head-on. **Statistiksekretess suppresses
values for small units**, and resursskolor are by their nature small. A source that covers every
mainstream school but blanks out exactly the schools in `df_utbud_resursskolor` is far less useful
than its headline coverage suggests. The probe must quantify this, not just mention it.

This story registers the source. It builds **no connector**; that is E04.

## Acceptance Criteria

- [ ] `project/data/kallor/skolverket-statistik.yaml` exists and passes `npm run validate:kallor`.
- [ ] A fixture is committed under
      `project/data/kallor/exempelsvar/skolverket-statistik/<YYYY-MM-DD>.<ext>` containing
      school-unit statistics for at least one of the nine in-scope kommuner, selected by SCB
      kommunkod.
- [ ] `anrop` records the worked request and shows how kommun and school-unit selection is made.
- [ ] The join to `skolenhetskod` from S03 is confirmed against the fixture, or the mismatch is
      recorded.
- [ ] The available measures and the available year range are enumerated.
- [ ] The suppression marker used for withheld values is identified in the fixture and recorded
      verbatim, so ingestion can later distinguish "suppressed" from "zero" and from "missing".
- [ ] `status` is set to `verifierad` only if the S01 verification bar is met.

## Definition of Done

- [ ] All acceptance criteria are met and CI passes.
- [ ] **A written note recording which years and which measures are suppressed by
      statistiksekretess for small units**, with the observed suppression threshold if it can be
      determined, and at least one concrete suppressed example from the committed fixture.
- [ ] A stated consequence: to what extent school-level statistics will be unavailable for
      resursskolor specifically, and what that means for the kärnfrågor.
- [ ] The distinction between suppressed, zero and missing is written down for E02 and E04 —
      collapsing them would silently corrupt every average built on this data.
- [ ] The verdict is written where S08 will read it.
- [ ] No connector, scheduler or database code is added by this story.
