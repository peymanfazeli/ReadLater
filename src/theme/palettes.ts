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
  | 'successSurface'
  | 'successText'
  | 'peach'
  | 'border'
  | 'white'
  | 'black'
  | 'error'
  | 'errorSurface';

// DESIGN.md palette (light).
export const light: Record<ColorToken, string> = {
  background: '#FAF6EF',
  surface: '#FFFFFF',
  primaryText: '#25283A',
  secondaryText: '#8D887F',
  primary: '#B9A2FF',
  primaryDark: '#6550A4',
  onPrimary: '#241A49',
  successSurface: '#D5EBDD',
  successText: '#477C5A',
  peach: '#F4D1C2',
  border: '#EAE4DB',
  white: '#FFFFFF',
  black: '#000000',
  error: '#D32F2F',
  errorSurface: '#FDECEA',
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
  successSurface: '#1E3628',
  successText: '#86D7A4',
  peach: '#4A3A2A',
  border: '#2C3140',
  white: '#FFFFFF',
  black: '#000000',
  error: '#F07070',
  errorSurface: '#3A2427',
};

export const palettes: Record<Scheme, Record<ColorToken, string>> = {
  light,
  dark,
};
