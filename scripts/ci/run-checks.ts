// The CI check runner. Executes every entry in scripts/ci/checks.ts, in declared order.
//
// EXECUTION: `node scripts/ci/run-checks.ts`, relying on Node 24's built-in TypeScript type
// stripping, which the .nvmrc pin of 24.18.0 guarantees. This was tried first and works, so `tsx`
// was NOT added: a devDependency whose only job is to run two files the runtime already runs is
// cost without benefit. Type stripping only erases types — it never transforms code — so this file
// and checks.ts must stay within erasable syntax: no enums, no namespaces, no parameter
// properties, and relative imports carry their real `.ts` extension — which is why tsconfig.json
// sets `allowImportingTsExtensions` (legal here because the project is `noEmit`). If a future entry
// needs something outside that, add `tsx` and change the `ci` script; nothing else depends on it.
//
// The `ci` script passes `--disable-warning=MODULE_TYPELESS_PACKAGE_JSON`: package.json declares no
// `"type"`, so Node reparses this file as ESM after detecting module syntax and says so loudly on
// every run. Adding `"type": "module"` to package.json would change how the whole app is loaded to
// silence one line of noise; the flag is the smaller change.
//
// FAILURE IS ANY NON-ZERO EXIT. `npm run typecheck` exits 2, not 1 (measured in E00_S02_T04), so
// the only safe test is `status === 0` for success.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { checks, type Check } from './checks.ts';

/**
 * Pre-flight validation. Returns a list of problems; an empty list means the registry is safe to
 * run. Exported for the unit tests, which cover both guard conditions.
 */
export function validateRegistry(
  entries: readonly Check[],
  scriptNames: readonly string[],
): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (seen.has(entry.id)) {
      problems.push(`duplicate id "${entry.id}" (owner ${entry.owner})`);
    }
    seen.add(entry.id);

    if (!scriptNames.includes(entry.command)) {
      problems.push(
        `check "${entry.id}" (owner ${entry.owner}) runs npm script "${entry.command}", ` +
          'which is not defined in package.json scripts',
      );
    }
  }

  return problems;
}

function packageScriptNames(): string[] {
  const raw = readFileSync(new URL('../../package.json', import.meta.url), 'utf8');
  const parsed = JSON.parse(raw) as { scripts?: Record<string, string> };
  return Object.keys(parsed.scripts ?? {});
}

function main(): void {
  const problems = validateRegistry(checks, packageScriptNames());
  if (problems.length > 0) {
    console.error('Check registry is invalid. No checks were run.');
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    process.exit(1);
  }

  const results: { check: Check; passed: boolean; seconds: string }[] = [];

  for (const check of checks) {
    console.log(`\n=== ${check.id} (${check.owner}) — ${check.description}`);
    const startedAt = Date.now();
    const run = spawnSync('npm', ['run', check.command], { encoding: 'utf8' });
    const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
    const passed = run.status === 0;

    if (!passed) {
      // Reproduce a failing check's output in full; a passing check's output is suppressed.
      process.stdout.write(run.stdout ?? '');
      process.stderr.write(run.stderr ?? '');
      console.error(`--- ${check.id} FAILED (exit ${String(run.status)})`);
    }

    results.push({ check, passed, seconds });
  }

  const failed = results.filter((result) => !result.passed);

  console.log('\n=== summary');
  for (const { check, passed, seconds } of results) {
    console.log(
      `${check.id.padEnd(12)} ${check.owner.padEnd(14)} ${passed ? 'PASS' : 'FAIL'}  ${seconds}s`,
    );
  }
  console.log(
    `${String(results.length)} checks: ${String(results.length - failed.length)} passed, ` +
      `${String(failed.length)} failed`,
  );

  if (failed.length > 0) {
    process.exit(1);
  }
}

// Run only when invoked directly, so the unit tests can import validateRegistry without executing
// the whole pipeline.
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
