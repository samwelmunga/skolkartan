---
id: E00_S01_T02
title: Strict TypeScript configuration and App Router skeleton
status: Pending
story_id: E00_S01
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S01_T01
---

# Task: Strict TypeScript configuration and App Router skeleton

## Description

Make the repository build. This task writes `tsconfig.json`, `next.config.ts` and the minimum
App Router tree that turns the dependencies installed by `E00_S01_T01` into a running
application serving one placeholder page.

Configuration and application files are delivered together deliberately: a `tsconfig.json` with no
files to compile cannot be verified (`tsc` reports TS18003, "No inputs were found in config file"),
and a `src/app/` tree with no `tsconfig.json` cannot be built. Splitting them would produce two
tasks neither of which can be tested.

Assumes `E00_S01_T01` has landed: `next` (15 or later), `react`, `react-dom`, `typescript` and the
`@types/*` packages are installed, and `package.json` has the `dev`, `build`, `start` and
`typecheck` scripts.

### `tsconfig.json`

Create at the repository root. Write it as **strict JSON with no comments** so that every tool that
reads it — `tsc`, Next.js, Prettier (`E00_S02`) and editors — agrees on how to parse it. The
rationale behind the non-obvious options is recorded in `docs/decisions.md` by `E00_S01_T04`, not
in this file.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "allowJs": false,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "incremental": true,
    "noEmit": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Notes on choices that are not free to change:

- `noUncheckedIndexedAccess: true` — array and record access returns `T | undefined`. Later Epics
  parse external payloads and must not be allowed to assume a key is present.
- `noImplicitOverride: true`, `forceConsistentCasingInFileNames: true` — development is on
  case-insensitive macOS, CI runs on case-sensitive Linux.
- `isolatedModules: true`, `moduleResolution: "bundler"` — required by, and matching, the Next.js
  compiler.
- `noEmit: true` — Next owns emit; `tsc` is only ever used for checking.
- `exactOptionalPropertyTypes` is deliberately **not** enabled. Do not add it.
- The root-level `"**/*.ts"` include is intentional: it already covers `scripts/**/*`, which
  `E00_S03` needs type-checked, so `E00_S03` will not have to edit this file.
- `incremental: true` writes `tsconfig.tsbuildinfo`; `E00_S01_T03` ignores `*.tsbuildinfo` in git.

### `next.config.ts`

Create at the repository root, minimal and typed, with no experimental flags:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;
```

There must be **no `typescript` key at all**, and therefore no `typescript.ignoreBuildErrors`.
`next build` type-checks by default; setting `ignoreBuildErrors: true` at any point is a defect,
not a workaround.

### `next-env.d.ts`

`next dev` / `next build` generate `next-env.d.ts` at the repository root. **Commit it.** It is
referenced by the `include` array above, and committing it is what keeps `git status` clean after
a build (an acceptance criterion of this story). Do not edit it by hand. If a build regenerates it
with different content, commit the regenerated version.

### `src/app/site-metadata.ts`

The story requires the `@/*` alias to demonstrably resolve from a file under `src/app/`. A shared
constants module provides that proof and is genuinely used by both files below, rather than being
an import added purely to satisfy a checkbox.

```ts
export const siteName = 'Skolkartan';
export const siteTagline = 'Applikationsskelett — ingen data ännu.';
```

It lives under `src/app/`, **not** `src/lib/`, because `src/lib/` must stay empty until `E00_S02`
adds the first real module there. A plain `.ts` file inside `src/app/` is not a route — the App
Router only treats reserved filenames (`page`, `layout`, `route`, and so on) as routes.

### `src/app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { siteName, siteTagline } from '@/app/site-metadata';

export const metadata: Metadata = {
  title: siteName,
  description: siteTagline,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
```

`lang="sv"` is a locale setting reflecting the eventual audience. It is not domain content.

No global stylesheet, no font loading, no provider components. Whichever Epic first needs styling
owns adding it.

### `src/app/page.tsx`

```tsx
import { siteName, siteTagline } from '@/app/site-metadata';

export default function Page() {
  return (
    <main>
      <h1>{siteName}</h1>
      <p>{siteTagline}</p>
      <p>Se README.md i repositoryts rot.</p>
    </main>
  );
}
```

No data fetching, no state, no client component directive.

**Recorded decision — the README reference is text, not a link.** The story asks for "a link to the
README", but `README.md` does not exist until `E00_S05` and Next.js cannot serve a Markdown file
from the repository root, so an anchor would be dead on arrival. A plain textual pointer is used
instead. `E00_S05` may replace it with a real hyperlink once the README exists and a hosting URL is
known.

### `src/lib/.gitkeep`

Create `src/lib/` containing an empty `.gitkeep` so the directory is tracked by git. Reserved for
shared modules; `E00_S02` adds the first real file (`src/lib/assertNever.ts`). Put nothing else
here.

### Domain constraint

E00 is pure infrastructure. No kommun, skola, nyckeltal or data source may appear in any file this
task creates or modifies. `siteName` and `siteTagline` name the project itself and nothing within
its subject matter.

## Acceptance Criteria

- [ ] `tsconfig.json` exists at the repository root, parses as strict JSON with no comments, and
      sets `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`,
      `forceConsistentCasingInFileNames: true`, `isolatedModules: true`, `noEmit: true` and
      `moduleResolution: "bundler"`.
- [ ] `tsconfig.json` does **not** set `exactOptionalPropertyTypes`.
- [ ] `tsconfig.json` sets `baseUrl: "."` and `paths` mapping `"@/*"` to `["./src/*"]`.
- [ ] `tsconfig.json`'s `include` array covers `**/*.ts` from the repository root, so files under a
      future `scripts/` directory are type-checked without editing this file.
- [ ] `next.config.ts` exists, is typed as `NextConfig`, and contains no `typescript` key and
      therefore no `ignoreBuildErrors`.
- [ ] `src/app/site-metadata.ts`, `src/app/layout.tsx` and `src/app/page.tsx` exist with the
      contents described above.
- [ ] `src/app/layout.tsx` renders `<html lang="sv">`.
- [ ] Both `layout.tsx` and `page.tsx` import from `@/app/site-metadata` using the alias, not a
      relative path, and `npm run build` resolves those imports successfully.
- [ ] `src/lib/.gitkeep` exists and `src/lib/` contains no other file.
- [ ] `npm run typecheck` exits zero.
- [ ] `npm run build` exits zero and reports a successful production build.
- [ ] `npm run dev` starts and the page served at the printed local URL shows the project name and
      tagline, with no error or warning in the browser console and none in the dev server output.
- [ ] `next-env.d.ts` exists at the repository root and is committed (not ignored by git).

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] `npm run typecheck` and `npm run build` are run twice in succession and pass both times.
- [ ] No dependency was added or removed by this task — `package.json`'s `dependencies` and
      `devDependencies` are byte-identical to what `E00_S01_T01` left.
- [ ] No script was added to `package.json` by this task.
- [ ] `src/` contains only `app/site-metadata.ts`, `app/layout.tsx`, `app/page.tsx` and
      `lib/.gitkeep` — nothing else.
- [ ] The reason the README reference is plain text rather than a hyperlink is recorded in the
      task's rapport, so `E00_S05` knows it is a deliberate placeholder and not an oversight.
- [ ] No file created or modified by this task references a kommun, skola, nyckeltal or data
      source.
- [ ] `E00_S02` can add ESLint, Prettier and Vitest without changing any strictness setting or the
      path alias in `tsconfig.json`.
