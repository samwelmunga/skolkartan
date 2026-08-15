---
id: E01_S03
title: "Källprobe: Skolverkets Skolenhetsregister"
status: Pending
epic_id: E01
date_created: 2026-08-15
date_started: null
date_completed: null
tasks: []
depends_on:
  - E01_S01
---

# Story: Källprobe: Skolverkets Skolenhetsregister

**ID**: E01_S03
**Epic**: E01 — Data Source Catalogue
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 2 — runs in parallel with S02, S04–S07.

## User Story

As the maintainer of Skolkartan, I want Skolverkets Skolenhetsregister probed and recorded, so
that I know whether the authoritative national list of school units can by itself identify
resursskolor — the single most valuable thing any source in this project could do.

## Description

Skolenhetsregistret is the authoritative register of skolenheter and the source of skolenhetskod,
the join key the whole project depends on. It is tier 1 and open.

The decisive question for this story is **not** whether the register lists schools — it does.
It is whether the register carries anything that identifies a resursskola. If it does, the
project's hardest kärnfråga (`df_utbud_resursskolor`) is largely solved by an open API. If it does
not, the answer must come from tier 3 manual work and the project's shape changes considerably.

This is therefore a **decision-forcing probe**, and its verdict must be unambiguous.

This story registers the source. It builds **no connector**; that is E03.

## Acceptance Criteria

- [ ] `project/data/kallor/skolenhetsregistret.yaml` exists and passes `npm run validate:kallor`.
- [ ] A fixture is committed under
      `project/data/kallor/exempelsvar/skolenhetsregistret/<YYYY-MM-DD>.<ext>` containing school
      units for at least one of the nine in-scope kommuner, selected by SCB kommunkod.
- [ ] `anrop` records the worked request and shows how kommun selection by kommunkod is made.
- [ ] Every field the register exposes per skolenhet is enumerated in the YAML, so the
      resursskola question can be judged from the record rather than re-fetched.
- [ ] The presence and stability of `skolenhetskod` as a join key is confirmed against the fixture.
- [ ] `kanda_begransningar` records how closures and re-openings are represented, and whether
      historical units remain retrievable.
- [ ] `status` is set to `verifierad` only if the S01 verification bar is met.

## Definition of Done

- [ ] All acceptance criteria are met and CI passes.
- [ ] **An explicit written verdict on the question: does the register carry a resursskola-markör,
      or a skolform/inriktning value that identifies one?** The verdict is a plain yes or no with
      the evidence quoted from the committed fixture — not a maybe, and not a plan to check later.
- [ ] If the answer is no, the consequence is written down for S08 and for E05: `df_utbud_resursskolor`
      and `df_malgrupp` must be sourced from tier 3.
- [ ] If the answer is yes, the exact field and its value domain are recorded, and it is flagged
      to E02 as a modelling input.
- [ ] The verdict is written where S08 will read it, not only in a commit message.
- [ ] No connector, scheduler or database code is added by this story.
