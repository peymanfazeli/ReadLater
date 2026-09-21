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

// Dark palette chosen for readability on dark surfaces (contrast notes in the
// module README), not mechanically mirrored from the light palette.
//
// `primaryText` (#F0EEF7) and `secondaryText` (#A9A6B8) on `surface`
// (#25283A) both exceed WCAG AA. `onPrimary` is the dark text used on the
// (lighter) dark-theme primary fill.
export const dark: Record<ColorToken, string> = {
  background: '#181A29',
  surface: '#25283A',
  primaryText: '#F0EEF7',
  secondaryText: '#A9A6B8',
  primary: '#C9B6FF',
  primaryDark: '#B9A2FF',
  onPrimary: '#1D1B30',
  successSurface: '#1E3628',
  successText: '#86D7A4',
  peach: '#5A4238',
  border: '#3A3E54',
  white: '#FFFFFF',
  black: '#000000',
  error: '#F07070',
  errorSurface: '#3A2427',
};

export const palettes: Record<Scheme, Record<ColorToken, string>> = {
  light,
  dark,
};
