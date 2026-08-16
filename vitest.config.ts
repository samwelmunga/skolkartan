import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Declared explicitly rather than through `vite-tsconfig-paths`. There is exactly one alias,
      // and reading it back out of tsconfig.json would cost a dependency to save one line.
      // Revisit if the alias set grows past two or three entries — at that point keeping this in
      // sync by hand becomes the more expensive option.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // No DOM environment (`jsdom` / `happy-dom`) is configured, because nothing renders yet. The
    // Epic that first tests a rendered component owns that addition; paying for a DOM shim on every
    // test run until then is waste.
    environment: 'node',

    // Tests are colocated with the code they test, as `<name>.test.ts` beside `<name>.ts`. One
    // convention, and no parallel __tests__ tree to keep in sync.
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],

    // Globals are deliberately off: `describe`, `it` and `expect` are imported explicitly in every
    // test file. Enabling them would require adding "vitest/globals" to compilerOptions.types in
    // tsconfig.json, and E00_S01's Definition of Done requires this story to add test tooling
    // without modifying that file. One import line per test file is the cheaper promise to keep.
    globals: false,

    // No coverage threshold. There is nothing meaningful to cover in an empty skeleton, and a
    // threshold on a near-empty codebase is a number that gets lowered rather than met. Coverage
    // stays available on demand via `vitest run --coverage`, but is not configured and not gated.
  },
});
