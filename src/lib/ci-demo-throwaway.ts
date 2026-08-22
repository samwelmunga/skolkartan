// Throwaway file for E00_S04_T02: proves the CI pipeline reports a broken commit as failing.
// Deliberate, unambiguous type error below. This file and the branch it lives on are deleted
// once the demonstration is recorded — it must never reach `main`.

const deliberatelyWrongType: number = 'this is a string, not a number';

export default deliberatelyWrongType;
