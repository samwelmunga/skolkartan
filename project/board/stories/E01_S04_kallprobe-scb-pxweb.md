---
id: E01_S04
title: "Källprobe: SCB (PxWeb, befolkning i skolåldern)"
status: Pending
epic_id: E01
date_created: 2026-08-15
date_started: null
date_completed: null
tasks: []
depends_on:
  - E01_S01
---

# Story: Källprobe: SCB (PxWeb, befolkning i skolåldern)

**ID**: E01_S04
**Epic**: E01 — Data Source Catalogue
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 2 — runs in parallel with S02, S03, S05–S07.

## User Story

As the maintainer of Skolkartan, I want SCB's PxWeb API probed for befolkning i skolåldern per
kommun, so that every per-pupil and per-capita comparison in the project has a verified
denominator with a known update cadence.

## Description

SCB supplies the denominators. Without population in the relevant age bands per kommun, a raw
count of resursskoleplatser is uncomparable between Malmö and Höör. Tier 1, open, but accessed
through **PxWeb**, whose POST-a-query-selection model is unlike the other sources and is the main
thing this probe must pin down.

Two specifics to establish: SCB's own `Region` codes must be confirmed to be SCB kommunkod (the
project's join key), and the age-band breakdown must be fine enough to isolate grundskoleåldern
rather than only broad bands.

This story registers the source. It builds **no connector**; that is E03.

## Acceptance Criteria

- [ ] `project/data/kallor/scb-befolkning.yaml` exists and passes `npm run validate:kallor`.
- [ ] A fixture is committed under
      `project/data/kallor/exempelsvar/scb-befolkning/<YYYY-MM-DD>.json` containing population
      data for at least one of the nine in-scope kommuner, selected by SCB kommunkod.
- [ ] `anrop` records the full PxWeb query — table path and the POST query selection body — so it
      can be replayed exactly. A bare table URL is not sufficient.
- [ ] The `Region` dimension is confirmed against the fixture to use SCB kommunkod, and the
      confirmation is recorded.
- [ ] The available age-band granularity is recorded, with a statement on whether
      grundskoleåldern can be isolated.
- [ ] `uppdateringsfrekvens` and the publication lag from reference date to availability are
      recorded.
- [ ] `kanda_begransningar` records PxWeb response-size caps and any need to page a query.
- [ ] `status` is set to `verifierad` only if the S01 verification bar is met.

## Definition of Done

- [ ] All acceptance criteria are met and CI passes.
- [ ] The recorded `anrop` has been replayed from scratch and reproduces the committed fixture.
- [ ] A written verdict on whether SCB can supply denominators at the granularity the dashboard
      Epics will need, or where it falls short.
- [ ] Kommunkod alignment between SCB, Kolada and Skolenhetsregistret is stated — any mismatch is
      flagged to E02, since the whole model joins on this key.
- [ ] No connector, scheduler or database code is added by this story.
