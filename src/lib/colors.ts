// 20-color palette matching Loop Habit Tracker's order
// Source: uhabits-android palette (material design, dark variants)
export const HABIT_COLORS: readonly string[] = [
  '#D32F2F', // 0  red
  '#E64A19', // 1  deep orange
  '#F57F17', // 2  amber
  '#F9A825', // 3  yellow
  '#AFB42B', // 4  lime
  '#689F38', // 5  light green
  '#388E3C', // 6  green
  '#00897B', // 7  teal
  '#00ACC1', // 8  cyan  ← Loop default
  '#039BE5', // 9  light blue
  '#1E88E5', // 10 blue
  '#3949AB', // 11 indigo
  '#8E24AA', // 12 purple
  '#D81B60', // 13 pink
  '#F06292', // 14 light pink
  '#FF7043', // 15 deep orange light
  '#8D6E63', // 16 brown
  '#90A4AE', // 17 blue grey light
  '#78909C', // 18 blue grey
  '#546E7A', // 19 blue grey dark
] as const

export function habitColor(index: number): string {
  return HABIT_COLORS[index] ?? HABIT_COLORS[8]
}
