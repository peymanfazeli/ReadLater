import {palettes} from './palettes';

// Legacy alias for the light palette, kept for callers that only ever needed
// the single default theme. New code should resolve colors through the active
// palette via `useTheme()`.
export const colors = palettes.light;
