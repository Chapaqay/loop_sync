// Source: uhabits-android/src/main/res/values/colors.xml + material_colors.xml
// darkPalette — used in dark mode (our app theme)
export const DARK_PALETTE: readonly string[] = [
  '#EF9A9A', // 0  red_200
  '#FFAB91', // 1  deep_orange_200
  '#FFCC80', // 2  orange_200
  '#FFECB3', // 3  amber_100
  '#FFF59D', // 4  yellow_200
  '#E6EE9C', // 5  lime_200
  '#C5E1A5', // 6  light_green_200
  '#69F0AE', // 7  green_A200
  '#80CBC4', // 8  teal_200
  '#80DEEA', // 9  cyan_200
  '#81D4FA', // 10 light_blue_200
  '#64B5F6', // 11 blue_300
  '#9FA8DA', // 12 indigo_200
  '#B39DDB', // 13 deep_purple_200
  '#CE93D8', // 14 purple_200
  '#F48FB1', // 15 pink_200
  '#BCAAA4', // 16 brown_200
  '#F5F5F5', // 17 grey_100
  '#E0E0E0', // 18 grey_300
  '#9E9E9E', // 19 grey_500
] as const

// lightPalette — used in light mode
export const LIGHT_PALETTE: readonly string[] = [
  '#D32F2F', // 0  red_700
  '#E64A19', // 1  deep_orange_700
  '#F57C00', // 2  orange_700
  '#FF8F00', // 3  amber_800
  '#F9A825', // 4  yellow_800
  '#AFB42B', // 5  lime_700
  '#7CB342', // 6  light_green_600
  '#388E3C', // 7  green_700
  '#00897B', // 8  teal_600
  '#00ACC1', // 9  cyan_600
  '#039BE5', // 10 light_blue_600
  '#1976D2', // 11 blue_700
  '#303F9F', // 12 indigo_700
  '#5E35B1', // 13 deep_purple_600
  '#8E24AA', // 14 purple_600
  '#D81B60', // 15 pink_600
  '#5D4037', // 16 brown_700
  '#424242', // 17 grey_800
  '#757575', // 18 grey_600
  '#9E9E9E', // 19 grey_500
] as const

export function habitColor(index: number, dark = true): string {
  const palette = dark ? DARK_PALETTE : LIGHT_PALETTE
  return palette[index] ?? palette[9] // default: cyan (index 9)
}
