// TODO: Step 7 — port Entry.kt: value constants, auto-fill logic between manual checks

export const ENTRY = {
  UNKNOWN: -1,
  NO: 0,
  YES_AUTO: 1,
  YES_MANUAL: 2,
  SKIP: 3,
} as const

export type EntryValue = (typeof ENTRY)[keyof typeof ENTRY]

export const NUMERIC_SCALE = 1000
