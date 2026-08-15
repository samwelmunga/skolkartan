---
id: E01_S02
title: Källprobe: Kolada
status: Pending
epic_id: E01
date_created: 2026-08-15
date_started: null
date_completed: null
tasks: []
depends_on:
  - E01_S01
---

# Story: Källprobe: Kolada

**ID**: E01_S02
**Epic**: E01 — Data Source Catalogue
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 2 — runs in parallel with S03–S07.

## User Story

As the maintainer of Skolkartan, I want Kolada probed and recorded in the källregister with an
evidenced verdict, so that I know exactly which delfrågor its kommunala nyckeltal can answer
before any connector is built for it.

## Description

Kolada (RKA) is the expected backbone for kommun-level nyckeltal — cost per pupil, lärartäthet,
behörighet and similar. It is a tier 1, open-API source and should be the easiest of the probes.
Its likely value is concentrated in the **stödfrågor**, and this story must say so plainly rather
than letting a high nyckeltal count imply the project's core questions are covered.

Probe it, commit a fixture, and record what it can and cannot do. Specifically establish whether
any Kolada nyckeltal distinguishes **resursskola or särskilt stöd provision** from general school
spending — if not, say so explicitly, because that is the finding that matters.

This story registers Kolada in the källregister. It builds **no connector**; that is E03.

## Acceptance Criteria

- [ ] `project/data/kallor/kolada.yaml` exists and passes `npm run validate:kallor`.
- [ ] A fixture is committed at `project/data/kallor/exempelsvar/kolada/<YYYY-MM-DD>.json`
      containing data for at least one of the nine in-scope kommuner, selected by SCB kommunkod.
- [ ] `anrop` records the worked request and shows how kommun selection by kommunkod is made.
- [ ] `besvarar_delfragor` lists every delfråga Kolada can answer, each justified by something
      visible in the committed fixture.
- [ ] `tier`, `atkomst`, `autentisering`, `licens` and `uppdateringsfrekvens` are recorded from
      Kolada's own documentation, with `dokumentation_url` pointing at it.
- [ ] `kanda_begransningar` records any rate limits, pagination behaviour and the lag between a
      reporting year ending and its data appearing.
- [ ] An explicit written verdict on whether any nyckeltal isolates resursskola or särskilt stöd
      provision from general school spending.
- [ ] `status` is set to `verifierad` only if the S01 verification bar is met; otherwise
      `kandidat` or `avvisad` with `avvisad_orsak`.

## Definition of Done

- [ ] All acceptance criteria are met and CI passes.
- [ ] The verdict states clearly which delfrågor Kolada answers and which it does not, with the
      kärnfråga/stödfråga band made explicit — a stödfråga-only source is recorded as such.
- [ ] Any kärnfråga Kolada was hoped to answer but cannot is written down as a gap for S08.
- [ ] The fixture is small enough to read by hand, or trimmed with the trimming noted in
      `noteringar`.
- [ ] No connector, scheduler or database code is added by this story.
