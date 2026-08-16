import { describe, expect, it } from 'vitest';

// Imported through the alias on purpose, never relatively. A path alias that resolves in the build
// but not under the test runner is a trap that costs an hour the first time someone hits it; this
// import is what proves it resolves in both.
import { assertNever } from '@/lib/assertNever';

type Flavour = 'alpha' | 'beta';

function describeFlavour(flavour: Flavour): string {
  switch (flavour) {
    case 'alpha':
      return 'first';
    case 'beta':
      return 'second';
    default:
      return assertNever(flavour);
  }
}

describe('assertNever', () => {
  it('lets an exhaustive switch compile and return each handled branch', () => {
    expect(describeFlavour('alpha')).toBe('first');
    expect(describeFlavour('beta')).toBe('second');
  });

  it('throws on an unexpected value, naming the value in the message', () => {
    expect(() => describeFlavour('gamma' as never)).toThrow('Unexpected value: gamma');
  });

  it('uses a supplied message verbatim', () => {
    expect(() => assertNever('gamma' as never, 'unhandled flavour')).toThrow('unhandled flavour');
  });

  it('rejects a plainly non-never argument at compile time', () => {
    // @ts-expect-error a string literal is not assignable to never
    expect(() => assertNever('gamma')).toThrow();
  });
});
