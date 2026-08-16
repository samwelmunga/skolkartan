# Project Summary

## Overview

**Skolkartan** is a school atlas for Lund and its neighbouring municipalities. It aggregates
school data that today is scattered across dozens of separate kommun websites, registries and
statistics portals, and presents it as a single comparable view.

The driving question is about **resursskolor**: how well-provisioned each kommun is for pupils
needing särskilt stöd, which målgrupper those schools serve, how each kommun organises särskilt
stöd, and which kommuner buy or sell places to their neighbours through samverkansavtal.

Two distinct kinds of information are held side by side:

- **Comparable nyckeltal** — numbers that can be ranked and charted across kommuner
  (lärartäthet, cost per pupil, behörighet, number of resursskolor).
- **Descriptive context** — facts that never appear in statistics but decide the answer, such as
  a kommun having a stated goal to build its own resursskolor versus buying places externally.

Every single fact in the system — statistical or descriptive — carries its **source and
retrieval date**. This is a research tool, so an unattributed number is worthless.

Roughly 70–80% of the data arrives automatically from open APIs (Kolada, Skolenhetsregistret,
SCB, Skolverket). The remainder is curated by hand from kommun websites, nämndprotokoll and
lokala styrdokument, and kept as version-controlled files in this repository.

### Goals

1. Replace the manual tour of many kommun websites with one queryable dataset.
2. Make kommuner genuinely comparable on särskilt stöd and resursskolor, not just on general
   school statistics.
3. Capture the non-obvious, non-statistical context behind each kommun's provision.
4. Keep full provenance so any figure can be traced back and re-checked.

### Scope

**In scope (v1):** Lund and adjacent kommuner — Lomma, Staffanstorp, Eslöv, Kävlinge, Sjöbo,
Höör, Burlöv and Malmö. The data model stays nationally generic so the geographic scope can
widen without a rewrite.

**Audience (v1):** a personal research tool. No authentication, no multi-user concerns, run
locally or on a private URL.

**Deferred:** geodata work — upptagningsområden, travel times, Lantmäteriet/Trafikverket
sources — is a plausible later phase but is deliberately not an Epic yet.

## Architecture & Structure

- **Single TypeScript codebase** — Next.js (App Router) serving both the REST API routes and
  the dashboard UI.
- **PostgreSQL** as the warehouse holding normalised kommun, school, nyckeltal and agreement
  data, with a provenance record attached to every fact.
- **Ingestion jobs** — per-source connectors that fetch, normalise and idempotently upsert into
  the warehouse, re-runnable on a schedule without duplicating rows.
- **Curated data as files** — YAML/Markdown per kommun, held in the repo, schema-validated, and
  loaded through the same ingestion path as the API sources. Git history supplies the audit
  trail and diffing for free; no admin UI or auth is needed.

## Epics

```json
[
  {
    "id": "E00",
    "title": "Project Foundation",
    "short_description": "Stand up the empty-but-real repository skeleton that every later Epic builds inside: a Next.js (App Router) application, TypeScript configuration, linting, formatting, a test runner, and a CI pipeline that gates every merge. Also delivers the README and the documentation skeleton under docs/. Contains no domain logic — no kommun, no skola, no nyckeltal, no data sources. Its product is the scaffolding and, critically, the CI hook that later Epics plug their own validators into, so a rule written once is enforced automatically on every subsequent change.",
    "date_added": "2026-08-15",
    "date_started": null,
    "related_stories": []
  },
  {
    "id": "E01",
    "title": "Data Source Catalogue",
    "short_description": "Build the källregister — the living, machine-readable reference of every data source the project can draw on (Kolada, Skolenhetsregistret, SCB, Skolverkets statistik-API, Sveriges dataportal, Skolinspektionen), recording documentation, access method, authentication, licensing, update cadence, known limitations and which of the project's eleven delfrågor each source can actually answer, evidenced by a committed example response. Sources are classified on three orthogonal axes: tier (which ingestion Epic owns it), åtkomst (how it is fetched) and besvarar_delfrågor (what it is worth). E01 owns the källregister as files only — it never touches Postgres; E02 loads the registry into a kalla table. Project documentation now lives in E00. This is the foundation that decides what the rest of the system can actually deliver.",
    "date_added": "2026-08-15",
    "date_started": null,
    "related_stories": [
      "E01_S01",
      "E01_S02",
      "E01_S03",
      "E01_S04",
      "E01_S05",
      "E01_S06",
      "E01_S07",
      "E01_S08"
    ]
  },
  {
    "id": "E02",
    "title": "Unified Data Model & Storage",
    "short_description": "Design and implement the schema that lets data from very different sources sit together: kommun, skolenhet, resursskola, nyckeltal time series, and samverkansavtal. Critically, every fact carries a provenance record with source and retrieval date. Also owns the kalla table that loads E01's file-based källregister into Postgres — including the tier-3-registers-routes-not-documents contract handed over by E01, so a tier 3 källa models a repeatable route with an effort estimate rather than a list of individual documents. Delivers the Postgres schema, migrations and shared TypeScript types that all later Epics build on.",
    "date_added": "2026-08-15",
    "date_started": null,
    "related_stories": []
  },
  {
    "id": "E03",
    "title": "Priority 1 Ingestion — Grunddata",
    "short_description": "Build the connectors for the three core open APIs: Kolada for municipal nyckeltal such as lärartäthet and cost per pupil, Skolverket's Skolenhetsregistret for the current list of school units, and SCB for population and demographic context. Ingestion must be idempotent and re-runnable so scheduled refreshes never duplicate or silently corrupt data.",
    "date_added": "2026-08-15",
    "date_started": null,
    "related_stories": []
  },
  {
    "id": "E04",
    "title": "Priority 2 Ingestion — Fördjupningsdata",
    "short_description": "Extend ingestion with the deeper statistical sources: Skolverket's statistics APIs for per-school results, behörighet and resource measures, plus discovery through Sveriges dataportal for datasets not yet catalogued. Moves the system from kommun-level comparison down to individual school level.",
    "date_added": "2026-08-15",
    "date_started": null,
    "related_stories": []
  },
  {
    "id": "E05",
    "title": "Priority 3 — Curated Resursskola & Samverkan Data",
    "short_description": "Establish the hand-curated layer that no API provides: which resursskolor exist, the målgrupper they serve, their capacity and operator, plus samverkansavtal recording which kommuner take external pupils from whom, and each kommun's stated policy on building versus buying places. Held as schema-validated YAML per kommun in the repo, with source references to nämndprotokoll and lokala styrdokument.",
    "date_added": "2026-08-15",
    "date_started": null,
    "related_stories": []
  },
  {
    "id": "E06",
    "title": "REST API",
    "short_description": "Expose the unified model as a documented read API covering kommuner, schools, resursskolor, nyckeltal and samverkansavtal, including comparison endpoints that return several kommuner side by side. Every response carries the provenance of the values it contains, and the surface is described by an OpenAPI specification.",
    "date_added": "2026-08-15",
    "date_started": null,
    "related_stories": []
  },
  {
    "id": "E07",
    "title": "Dashboard — Kommun Comparison",
    "short_description": "The primary comparison interface: select several kommuner and view their nyckeltal side by side as tables and charts, with source and date visible on every figure rather than hidden away. This is what replaces the manual tour of separate kommun websites.",
    "date_added": "2026-08-15",
    "date_started": null,
    "related_stories": []
  },
  {
    "id": "E08",
    "title": "Dashboard — Resursskolor & Samverkan Network",
    "short_description": "The view that answers the project's core question. Shows which kommuner have resursskolor and for which målgrupper, alongside the network of samverkansavtal revealing who buys places from whom. Combines a geographic view, a relationship view and the descriptive per-kommun context on how särskilt stöd is organised.",
    "date_added": "2026-08-15",
    "date_started": null,
    "related_stories": []
  },
  {
    "id": "E09",
    "title": "Data Quality, Freshness & Operations",
    "short_description": "Keep the dataset trustworthy over time: track how stale each fact is, detect when an upstream API changes shape or breaks, and report coverage gaps showing which kommuner still lack curated resursskola data. Also covers deployment and the scheduled refresh runs that keep ingestion current. Inherits källkatalog staleness monitoring from E01 — E01 leaves behind the npm run probe:kallor seam and the senast_kontrollerad field, and E09 takes ownership of running them on a schedule and alerting when a source drifts from its committed exempelsvar. That handoff is what allows E01 to close rather than stay permanently open as sources change.",
    "date_added": "2026-08-15",
    "date_started": null,
    "related_stories": []
  }
]
```

## Conventions

- **Swedish domain terms are kept verbatim** in code, schema and UI — `resursskola`,
  `samverkansavtal`, `kommun`, `nyckeltal`, `särskilt stöd`, `huvudman`. Translating them loses
  meaning and breaks the link back to source documents.
- **Exception — diacritics are ASCII-folded in machine identifiers.** Field names, enum values,
  ids and other machine-readable identifiers drop Swedish diacritics: `geografisk_tackning`,
  `arligen`, `utgangen`, `kanda_begransningar`. The term itself is still kept Swedish — only the
  diacritics fold. **Full Swedish with diacritics is preserved in `namn` and in every prose
  value**, so nothing human-readable is degraded.

  The reason is that these strings do not stay in one place: they become **Postgres enum labels,
  TypeScript union members and URL path segments**. Across those three contexts, non-ASCII
  characters invite encoding mismatches, inconsistent normalisation (NFC versus NFD) and
  percent-encoded URLs that no longer read as the word they came from. Folding once, at the
  identifier boundary, is cheaper than handling that in three layers.

  This is a deliberate, recorded exception to the verbatim rule above, agreed during E01 planning.
  It applies only to identifiers — never to display text, and never to quoted source material.
- **Kommuner are identified by SCB kommunkod**, schools by Skolverket's skolenhetskod. Names are
  for display only, never for joining.
- **No fact without provenance.** Every stored value records its source and the date it was
  retrieved or asserted.
- **Ingestion is idempotent.** Re-running any connector over the same period must converge to
  the same state.
- **API data and curated data share one model.** Curated files are validated and loaded through
  the same path as API sources, differing only in their provenance record.
