---
id: E01
title: Data Source Catalogue
status: Pending
date_created: 2026-08-15
date_started: null
date_completed: null
stories:
  - E01_S01
  - E01_S02
  - E01_S03
  - E01_S04
  - E01_S05
  - E01_S06
  - E01_S07
  - E01_S08
depends_on:
  - E00
docs: ["docs/kallor.md"]
---

# Epic: Data Source Catalogue

## Short Description

Build the **källregister** — the living, machine-readable reference of every data source the
project can draw on (Kolada, Skolverkets Skolenhetsregister, SCB, Skolverkets statistik-API,
Sveriges dataportal, Skolinspektionen and others). Each source records its documentation, access
method, authentication, licence, update cadence, known limitations and — the part that matters —
**which of the project's delfrågor it can actually answer**, evidenced by a committed example
response.

E01 owns the källregister **as files only**. It never creates a table, never opens a database
connection and never touches Postgres; E02 is what loads the registry into a `kalla` table. The
Epic's output is a validated set of YAML files, a typed loader, a CI validator and a generated
källkatalog, plus a coverage verdict that tells us which questions the project can answer and
which it cannot.

## Purpose

The driving question — how well each kommun is provisioned for pupils needing särskilt stöd —
is not answered by any single source, and some parts of it may not be answerable from open data
at all. Building connectors before knowing that is how a project spends three months ingesting
nyckeltal and then discovers no source names a resursskolas målgrupp.

This Epic exists to **find that out first, cheaply, and on the record**. Every claim about a
source is backed by a committed fixture, not by reading its documentation and hoping.

## The delfrågor

Coverage is measured against eleven delfrågor, split into two bands. **The band split is
load-bearing** and must survive into reporting: tiers 1–2 will score well on stödfrågor, and a
single blended coverage number would hide the fact that the kärnfrågor are the reason the project
exists.

**Kärnfrågor** — the project fails without these:

| id | question |
|----|----------|
| `df_utbud_resursskolor` | Which resursskolor exist in each kommun? |
| `df_malgrupp` | Which målgrupp does each resursskola serve? |
| `df_kapacitet` | How many places does each have, and how many are filled? |
| `df_organisation_sarskilt_stod` | How does each kommun organise särskilt stöd? |
| `df_samverkan_flode` | Which kommuner buy places from which, and in what volume? |
| `df_policy_bygga_vs_kopa` | What is each kommun's stated policy on building versus buying places? |

**Stödfrågor** — valuable context, but no substitute:

| id | question |
|----|----------|
| `df_behov_omfattning` | How large is the underlying need in each kommun? |
| `df_resursinsats` | What resources are put in — cost per pupil, lärartäthet, specialpedagogtäthet? |
| `df_utfall` | What are the outcomes — behörighet, betyg, närvaro? |
| `df_skolutbud_grund` | What is the baseline school provision in each kommun? |
| `df_kommunkontext` | What is the demographic and economic context of each kommun? |

## The three orthogonal axes

A source is classified on three independent axes. They are deliberately **not** collapsed into a
single priority score, because they answer different questions and a source can rank high on one
and low on another.

- **`tier`** — *which ingestion Epic owns this source.* Tier 1 → E03, tier 2 → E04, tier 3 → E05.
  This is a routing decision, not a quality judgement.
- **`atkomst`** — *how the data is physically fetched.* Open API, PxWeb, file download, scraping,
  manual reading, or a formal begäran om allmän handling. This drives effort and automatability.
- **`besvarar_delfragor`** — *what the source is worth to us.* Which delfrågor it can answer. A
  tier 3, manually read source that answers `df_malgrupp` is worth more to this project than a
  polished tier 1 API that only answers `df_kommunkontext`.

**Tier 3 registers routes, not documents.** A tier 3 entry describes a repeatable way of getting
at information (for example "Skolinspektionens beslutsdatabas, filtered to fristående-godkännande
for kommun X") together with an effort estimate. It does **not** enumerate individual documents.
This contract is written down in S01 and handed to E02 so that the `kalla` table models a route.

## Scope

**In scope**

- The YAML registry at `project/data/kallor/<id>.yaml`, one file per source.
- Committed example responses at `project/data/kallor/exempelsvar/<id>/<YYYY-MM-DD>.<ext>`.
- The Zod schema, generated JSON Schema, validator and typed loader.
- Probing each candidate source and recording an evidenced verdict.
- The tier 3 åtkomstbedömning — how hard is each non-API route, in kommun-hours.
- The generated `docs/kallor.md` and the coverage analysis.

**Out of scope**

- Any Postgres table, migration or database connection — that is E02.
- Building any production connector — those are E03, E04 and E05.
- Ingesting, normalising or storing actual school data.
- Ongoing staleness monitoring. E01 leaves the `npm run probe:kallor` seam behind; **E09 inherits
  källkatalog staleness monitoring from it.** That handoff is what allows E01 to close rather
  than stay open forever as sources drift.

## Execution waves

- **Wave 1 — S01.** Blocking. Nothing else can be written until the schema exists.
- **Wave 2 — S02, S03, S04, S05, S06, S07 in parallel.** S07 is the long pole and starts *with*
  the probes, not after them, because a begäran om allmän handling has a response time measured
  in weeks.
- **Wave 3 — S08.** Needs every probe verdict in.

## Definition of Done

- [ ] Every source discussed in the brainstorm has a YAML file under `project/data/kallor/`
      whose `status` is one of `verifierad`, `avvisad`, `utgangen` or `kandidat` — no source is
      left undecided.
- [ ] Every `verifierad` source carries a committed fixture containing data for at least one of
      the nine in-scope kommuner, selected by SCB kommunkod.
- [ ] `npm run validate:kallor` passes and runs in CI on every change, via the E00 validator hook.
- [ ] `laddaKallor()` returns typed, validated entries and throws on an unknown id.
- [ ] `npm run probe:kallor` exists as a working seam and is documented as E09's inheritance.
- [ ] `docs/kallor.md` is generated from the YAML and is never hand-edited.
- [ ] Coverage is reported per delfråga with **kärnfrågor and stödfrågor stated separately**, and
      no blended headline number is published.
- [ ] Each of the six kärnfrågor has an explicit written verdict: which source answers it, or a
      statement that no source found does, with the consequence for the project spelled out.
- [ ] The tier-3-registers-routes-not-documents contract is written down and handed to E02.
- [ ] No file produced by this Epic imports a database client or references a Postgres table.
