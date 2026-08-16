import { describe, expect, it } from 'vitest';
import { validateRegistry } from './run-checks.ts';
import type { Check } from './checks.ts';

const entry = (id: string, command: string, owner = 'E00'): Check => ({
  id,
  description: `${id} description`,
  command,
  owner,
});

describe('validateRegistry', () => {
  it('accepts a registry whose ids are unique and whose commands all exist', () => {
    expect(
      validateRegistry([entry('lint', 'lint'), entry('test', 'test')], ['lint', 'test']),
    ).toEqual([]);
  });

  it('rejects two entries sharing an id, naming the id and the owner', () => {
    const problems = validateRegistry(
      [entry('lint', 'lint'), entry('lint', 'lint:fix', 'E01')],
      ['lint', 'lint:fix'],
    );

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('duplicate id "lint"');
    expect(problems[0]).toContain('E01');
  });

  it('rejects an entry whose command is not a package.json script, naming the entry', () => {
    const problems = validateRegistry([entry('typo', 'typcheck', 'E01')], ['lint', 'typecheck']);

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('"typo"');
    expect(problems[0]).toContain('typcheck');
    expect(problems[0]).toContain('E01');
  });
});
