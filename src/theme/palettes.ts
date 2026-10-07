export type Scheme = 'light' | 'dark';

// Every color both themes must define. Components resolve colors through the
// active palette with `useTheme().colors`; nothing outside this file may pick
// a palette directly.
export type ColorToken =
  | 'background'
  | 'surface'
  | 'primaryText'
  | 'secondaryText'
  | 'primary'
  | 'primaryDark'
  | 'onPrimary'
  | 'glow'
  | 'successSurface'
  | 'successText'
  | 'peach'
  | 'border'
  | 'white'
  | 'black'
  | 'error'
  | 'errorSurface'
  | 'ink';

// DESIGN.md palette (light).
export const light: Record<ColorToken, string> = {
  background: '#F5EFE6',
  surface: '#FFFDF9',
  primaryText: '#2C221E',
  secondaryText: '#82756A',
  primary: '#D4A373',
  primaryDark: '#8C5830',
  onPrimary: '#FFFFFF',
  glow: 'rgba(212, 163, 115, 0.45)',
  successSurface: '#E2ECDF',
  successText: '#3D6348',
  peach: '#E8C2B5',
  border: '#D8CDBF',
  white: '#FFFFFF',
  black: '#000000',
  error: '#B83A3A',
  errorSurface: '#FADBD8',
  // Old-ink color for text on parchment (help modal). Theme-independent: ink
  // on paper looks the same in both themes — contrast on the dimmed
  // parchment ≈4.5:1 (AA).
  ink: '#2A1B10',
};

// Dark palette ("Deep Midnight Indigo" + champagne accent), hand-picked for
// readability on dark surfaces, not mechanically mirrored from the light
// palette.
//
// `primaryText` (#EDEFEF) and `secondaryText` (#8C92A4) on `surface`
// (#1E222D) both exceed WCAG AA (≈15:1 and ≈5.1:1). `onPrimary` is the dark
// text used on the (light) champagne primary fill (≈7.6:1).
export const dark: Record<ColorToken, string> = {
  background: '#14171F',
  surface: '#1E222D',
  primaryText: '#EDEFEF',
  secondaryText: '#8C92A4',
  primary: '#E0A96D',
  primaryDark: '#C4894E',
  onPrimary: '#2A2117',
  glow: 'rgba(224, 169, 109, 0.6)',
  successSurface: '#1E3628',
  successText: '#86D7A4',
  peach: '#4A3A2A',
  border: '#2C3140',
  white: '#FFFFFF',
  black: '#000000',
  error: '#F07070',
  errorSurface: '#3A2427',
  ink: '#2A1B10',
};

export const palettes: Record<Scheme, Record<ColorToken, string>> = {
  light,
  dark,
};
