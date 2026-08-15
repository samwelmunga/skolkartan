---
id: E01_S06
title: "Källprobe: Sveriges dataportal (upptäckt)"
status: Pending
epic_id: E01
date_created: 2026-08-15
date_started: null
date_completed: null
tasks: []
depends_on:
  - E01_S01
---

# Story: Källprobe: Sveriges dataportal (upptäckt)

**ID**: E01_S06
**Epic**: E01 — Data Source Catalogue
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 2 — runs in parallel with S02–S05, S07.

## User Story

As the maintainer of Skolkartan, I want a strictly time-boxed discovery pass over Sveriges
dataportal, so that any obvious catalogued dataset we have overlooked is caught now — without the
search turning into an open-ended trawl.

## Description

Sveriges dataportal is the national catalogue of open data. It is a **discovery** source, not a
data source: it is unlikely to serve project data directly, but it may point at a kommunal or
regional dataset none of the other probes would surface.

The risk here is not that we find too little. It is that this story never ends. Open data
catalogues reward endless browsing and punish it with low-quality hits, and the six kärnfrågor
will not be answered by a dataset that happens to be well-tagged.

**Hard cap: at most five further sources may be registered by this story, and every one of them
is registered as `status: kandidat`.** Not verified, not promoted, not probed in depth here. If
more than five look promising, register the five strongest and record the remainder as a note for
a future story. If nothing worthwhile is found, that is a perfectly good result — record it and
close.

## Acceptance Criteria

- [ ] `project/data/kallor/sveriges-dataportal.yaml` exists and passes `npm run validate:kallor`,
      recording the portal itself with `besvarar_delfragor` reflecting its discovery-only role.
- [ ] A fixture of a search response is committed under
      `project/data/kallor/exempelsvar/sveriges-dataportal/<YYYY-MM-DD>.<ext>`.
- [ ] The search terms and filters used are recorded in `anrop`, so the pass is reproducible.
- [ ] **At most five** further source files are created by this story.
- [ ] Every source created by this story has `status: kandidat`. No source is set to `verifierad`
      here.
- [ ] Each candidate records why it was picked and which delfråga it might answer.
- [ ] Any promising leads beyond the cap of five are listed in `noteringar` on the portal's own
      entry, not registered as files.

## Definition of Done

- [ ] All acceptance criteria are met and CI passes.
- [ ] The discovery pass is time-boxed and the box is respected; the search is documented well
      enough to re-run, not to re-invent.
- [ ] A written verdict on whether the portal surfaced anything the targeted probes missed,
      including an explicit "nothing found" if that is the outcome.
- [ ] Candidates are visibly separated from verified sources in S08's reporting, so unverified
      discoveries cannot inflate the coverage figure.
- [ ] No candidate is promoted beyond `kandidat` without its own probe story.
- [ ] No connector, scheduler or database code is added by this story.
