/**
 * Exhaustiveness helper. Call it in the default branch of a switch over a union:
 * if every member is handled, `value` narrows to `never` and this compiles. If a
 * member is added later and left unhandled, the call becomes a type error at the
 * point the case was forgotten.
 *
 * At runtime it throws, so an unexpected value coming from outside the type system
 * (a parsed payload, for instance) fails loudly rather than falling through silently.
 */
export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${String(value)}`);
}
