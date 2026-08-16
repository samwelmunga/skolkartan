// The CI check registry.
//
// This is the ONE file an Epic edits to have its own validator enforced on every merge. Append an
// entry, add the matching npm script to package.json, and `npm run ci` picks it up. Do not add a
// step to `.github/workflows/` — the workflow runs `npm run ci` and nothing else. See
// docs/ci-checks.md.

export type Check = {
  id: string; // stable kebab-case identifier
  description: string; // one line, printed in the summary
  command: string; // an npm script name, invoked as `npm run <command>`
  owner: string; // the Epic that registered it
};

// Ordered: cheapest and most-often-wrong first, so a failing run's full output is readable from the
// top. The runner does not stop at the first failure, so order is about reading, not short-circuit.
export const checks: Check[] = [
  {
    id: 'lint',
    description: 'ESLint over the whole repository, warnings treated as errors',
    command: 'lint',
    owner: 'E00',
  },
  {
    id: 'typecheck',
    description: 'TypeScript in strict mode with no emit',
    command: 'typecheck',
    owner: 'E00',
  },
  {
    id: 'test',
    description: 'Vitest suite, single run',
    command: 'test',
    owner: 'E00',
  },
  {
    id: 'build',
    description: 'Next.js production build',
    command: 'build',
    owner: 'E00',
  },
];
