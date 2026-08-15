---
id: E01_S01
title: Källregistret — schema, validator och laddare
status: Pending
epic_id: E01
date_created: 2026-08-15
date_started: null
date_completed: null
tasks: []
depends_on:
  - E00
---

# Story: Källregistret — schema, validator och laddare

**ID**: E01_S01
**Epic**: E01 — Data Source Catalogue
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 1 — blocking. S02–S07 cannot start until this is done.

## User Story

As the maintainer of Skolkartan, I want every data source described by one validated, typed
schema, so that a source's claims about itself can be trusted, checked automatically in CI, and
loaded by later Epics without a second parsing story.

## Description

This story creates the shape of the källregister and the machinery around it. It registers **no
real sources** beyond whatever fixture is needed to prove the validator works — S02 through S07
do that. Getting this wrong blocks six parallel stories, so it is deliberately done alone first.

Layout:

- **Registry** — one file per source at `project/data/kallor/<id>.yaml`.
- **Fixtures** — `project/data/kallor/exempelsvar/<id>/<YYYY-MM-DD>.<ext>`, one directory per
  source, one file per retrieval date, extension matching the payload (`.json`, `.xml`, `.csv`,
  `.pdf`).
- **Schema** — Zod, at `src/lib/kallor/schema.ts`. Single source of truth.
- **JSON Schema** — generated from the Zod schema as a **build artefact**, never hand-written and
  never committed as an editable file. It exists so editors and non-TypeScript tooling can
  validate the YAML.

### Identifier convention — documented exception

Machine identifiers are **ASCII-folded**: `geografisk_tackning`, `arligen`, `utgangen`,
`kanda_begransningar`. Full Swedish with diacritics is preserved in `namn` and in every prose
value. This is an explicit, recorded exception to the project's verbatim-Swedish convention,
because these strings become Postgres enum labels, TypeScript union members and URL path
segments. Field names and enum values fold; human-readable text does not.

### The three axes

- `tier` — which ingestion Epic owns the source (1 → E03, 2 → E04, 3 → E05).
- `atkomst` — how it is physically fetched.
- `besvarar_delfragor` — which delfrågor it can answer.

These are independent and must not be collapsed into a single score.

### Required fields

| field | type |
|---|---|
| `id` | ASCII slug, matches `^[a-z0-9]+(-[a-z0-9]+)*$`, equals the filename stem |
| `namn` | full Swedish name, diacritics preserved |
| `huvudman` | publishing organisation |
| `tier` | `1` \| `2` \| `3` |
| `atkomst` | `oppet_api` \| `pxweb` \| `filnedladdning` \| `webbskrapning` \| `manuell_utlasning` \| `begaran_om_allman_handling` \| `okand` |
| `status` | `kandidat` \| `verifierad` \| `avvisad` \| `utgangen` |
| `besvarar_delfragor` | non-empty array of known `df_*` ids |
| `geografisk_tackning` | `nationell` \| `regional` \| `kommunal` \| `okand` |
| `uppdateringsfrekvens` | `kontinuerligt` \| `manatligen` \| `kvartalsvis` \| `terminsvis` \| `arligen` \| `oregelbundet` \| `engangs` \| `okand` |
| `licens` | `cc0` \| `cc_by` \| `cc_by_sa` \| `psi_data` \| `oklart` |
| `dokumentation_url` | URL |
| `senast_kontrollerad` | ISO date |

`oklart` and `okand` are deliberately allowed. An honest "we do not know" is a valid state and
must not be forced into a false certainty to satisfy the schema.

### Optional fields

`bas_url`, `autentisering` (`ingen` \| `api_nyckel` \| `oauth` \| `okand`), `anrop` (worked
example request showing kommun selection), `exempelsvar` (fixture paths), `kanda_begransningar`
(array of Swedish prose strings), `statistiksekretess` (note on suppression), `atkomstbedomning`
(tier 3 route description plus effort estimate in kommun-hours), `beroenden` (other source ids),
`avvisad_orsak`, `noteringar`.

### The ten validator rules

1. `id` matches the ASCII slug pattern and is identical to the filename stem.
2. `id` is unique across the whole registry.
3. `status: verifierad` requires at least one `exempelsvar` path, and that file must exist on disk.
4. `status: verifierad` requires `anrop`, and `anrop` must show how kommun selection is made.
5. A `verifierad` source's fixture must contain data for at least one of the nine in-scope
   kommunkoder: `1281` Lund, `1262` Lomma, `1230` Staffanstorp, `1285` Eslöv, `1261` Kävlinge,
   `1265` Sjöbo, `1267` Höör, `1231` Burlöv, `1280` Malmö.
6. `besvarar_delfragor` is non-empty and every entry is a known delfråga id.
7. `tier: 3` requires `atkomstbedomning`, including an effort estimate in kommun-hours.
8. `atkomst: oppet_api` or `pxweb` requires both `bas_url` and `autentisering`.
9. `status: avvisad` requires `avvisad_orsak`; `status: utgangen` requires at least one
   `kanda_begransningar` entry explaining the expiry.
10. `senast_kontrollerad` is a valid ISO date, not in the future, and no fixture filename carries
    a date later than it.

### Verification bar

**HTTP 200 is not verification.** A source reaches `status: verifierad` only when rules 3, 4 and 5
all hold — a committed fixture containing real data for at least one in-scope kommun, selected by
SCB kommunkod, with the recorded `anrop` showing how that selection is made. A source that
returns data nationally but offers no way to filter to a kommun is `kandidat`, not `verifierad`.

### Seams left behind

- **`npm run probe:kallor`** — a working script that re-fetches each `verifierad` source's `anrop`
  and reports drift against the committed fixture. E01 leaves it as a manually-run seam; **E09
  inherits it** as the basis for källkatalog staleness monitoring.
- **Tier 3 registers routes, not documents** — written down in `docs/` and handed to E02, so the
  future `kalla` table models a repeatable route with an effort estimate rather than a list of
  individual documents.

## Acceptance Criteria

- [ ] `src/lib/kallor/schema.ts` defines the Zod schema with exactly the required and optional
      field split above, and is the only place the shape is declared.
- [ ] All enums are ASCII-folded; `oklart` and `okand` are accepted values where listed.
- [ ] A JSON Schema is generated from the Zod schema by a build step, and regenerating it produces
      no diff when the Zod schema is unchanged.
- [ ] All ten validator rules are implemented, and each has a test proving it rejects a violating
      fixture and accepts a conforming one.
- [ ] `npm run validate:kallor` validates every file in `project/data/kallor/`, exits non-zero on
      any violation, and names the offending file and rule.
- [ ] `npm run validate:kallor` is registered in CI through the E00 validator hook and blocks a
      merge on failure.
- [ ] `laddaKallor()` returns fully typed, validated entries.
- [ ] Requesting an unknown source id throws, with the unknown id in the message. It does not
      return `undefined` or `null`.
- [ ] `npm run probe:kallor` exists, runs, and reports drift for at least one example source.
- [ ] The registry and fixture directory conventions are followed exactly, including the
      `<YYYY-MM-DD>.<ext>` fixture filename form.

## Definition of Done

- [ ] All acceptance criteria are met and the test suite passes in CI.
- [ ] The ASCII-folding exception is documented in `PROJECT_SUMMARY.md`'s Conventions section
      with its reason, and restated in `docs/`.
- [ ] The eleven delfråga ids are defined in one place, with the kärnfråga/stödfråga band recorded
      as data, not as a comment — S08's coverage reporting reads that band split.
- [ ] The tier-3-registers-routes-not-documents contract is written down and explicitly addressed
      to E02.
- [ ] `npm run probe:kallor` is documented as the seam E09 inherits for staleness monitoring.
- [ ] A worked example YAML file exists showing every field populated, usable as a template by
      S02–S07.
- [ ] No database client is imported and no Postgres table is referenced anywhere in this story's
      output.
- [ ] S02–S07 can begin without further schema changes; any change needed after this point is an
      amendment, not an assumption.
