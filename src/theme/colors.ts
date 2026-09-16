export const colors = {
  background: '#FAF6EF',
  surface: '#FFFFFF',
  primaryText: '#25283A',
  secondaryText: '#8D887F',
  primary: '#B9A2FF',
  primaryDark: '#6550A4',
  successSurface: '#D5EBDD',
  successText: '#477C5A',
  peach: '#F4D1C2',
  border: '#EAE4DB',
  darkBackground: '#181A29',
  darkSurface: '#25283A',
  white: '#FFFFFF',
  black: '#000000',
  error: '#D32F2F',
  errorSurface: '#FDECEA',
} as const;

export type ColorToken = keyof typeof colors;
