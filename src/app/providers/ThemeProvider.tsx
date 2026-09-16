import React, {createContext, useContext} from 'react';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {radii} from '../../theme/radii';
import {typography} from '../../theme/typography';
import {shadows} from '../../theme/shadows';

const theme = {colors, spacing, radii, typography, shadows} as const;

type Theme = typeof theme;

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
