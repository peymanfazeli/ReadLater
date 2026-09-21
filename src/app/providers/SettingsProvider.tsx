import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {AccessibilityInfo} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {palettes, type ColorToken, type Scheme} from '../../theme/palettes';
import {radii} from '../../theme/radii';
import {shadows} from '../../theme/shadows';
import {spacing} from '../../theme/spacing';
import {typography} from '../../theme/typography';
import {applyRTLSetting, DEFAULT_LANGUAGE, translate} from '../../i18n';
import type {Language, TranslationKey} from '../../i18n';

const STORAGE_KEY = '@badabekhoon/settings/v1';

export type Settings = {
  language: Language;
  scheme: Scheme;
};

export type ThemeTokens = {
  scheme: Scheme;
  colors: Record<ColorToken, string>;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
};

export type TransitionOrigin = {x: number; y: number};

type ActiveTransition = {
  // Bumped on every toggle so a rapid second tap restarts the overlay cleanly.
  key: number;
  origin: TransitionOrigin;
  // Background color the screen had before the flip; the wave shrinks from
  // this color to reveal the already-applied new theme.
  fromColor: string;
};

type SettingsContextValue = {
  loaded: boolean;
  settings: Settings;
  isRTL: boolean;
  direction: 'rtl' | 'ltr';
  language: Language;
  setLanguage: (language: Language) => void;
  scheme: Scheme;
  setScheme: (scheme: Scheme) => void;
  toggleScheme: () => void;
  t: (
    key: TranslationKey,
    params?: Record<string, string | number>,
  ) => string;
  theme: ThemeTokens;
  transition: ActiveTransition | null;
  beginThemeTransition: (origin: TransitionOrigin) => void;
  endThemeTransition: () => void;
};

const Context = createContext<SettingsContextValue | null>(null);

function parseSettings(raw: string | null): Settings {
  if (!raw) {
    return {language: DEFAULT_LANGUAGE, scheme: 'light'};
  }
  try {
    const parsed = JSON.parse(raw) as {language?: unknown; scheme?: unknown};
    return {
      language: parsed.language === 'en' ? 'en' : 'fa',
      scheme: parsed.scheme === 'dark' ? 'dark' : 'light',
    };
  } catch {
    return {language: DEFAULT_LANGUAGE, scheme: 'light'};
  }
}

export function SettingsProvider({children}: {children: React.ReactNode}) {
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    language: DEFAULT_LANGUAGE,
    scheme: 'light',
  });
  const [transition, setTransition] = useState<ActiveTransition | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const nextTransitionKey = useRef(0);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (active) {
        setReduceMotion(value);
      }
    });
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (active) {
        setSettings(parseSettings(raw));
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: Settings) => {
    setSettings(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // Best-effort: a failed write only loses the preference after restart,
      // never any message data. The write is retried on the next change.
    });
  }, []);

  const setLanguage = useCallback(
    (language: Language) => {
      applyRTLSetting(language);
      persist({...settings, language});
    },
    [persist, settings],
  );

  // Plain theme flip, used from Settings and by toggleScheme.
  const setScheme = useCallback(
    (scheme: Scheme) => persist({...settings, scheme}),
    [persist, settings],
  );

  const toggleScheme = useCallback(() => {
    setScheme(settings.scheme === 'light' ? 'dark' : 'light');
  }, [setScheme, settings.scheme]);

  // Theme flip wrapped in the circular reveal. The flip is synchronous, so
  // even an interrupted or restarted animation leaves the correct theme. With
  // reduced motion enabled the flip happens with no animation at all.
  const beginThemeTransition = useCallback(
    (origin: TransitionOrigin) => {
      const next: Settings = {
        ...settings,
        scheme: settings.scheme === 'light' ? 'dark' : 'light',
      };
      if (reduceMotion) {
        persist(next);
        setTransition(null);
        return;
      }
      nextTransitionKey.current += 1;
      setSettings(next);
      persist(next);
      setTransition({
        key: nextTransitionKey.current,
        origin,
        fromColor: palettes[settings.scheme].background,
      });
    },
    [reduceMotion, persist, settings],
  );

  const endThemeTransition = useCallback(() => {
    setTransition(null);
  }, []);

  const theme = useMemo<ThemeTokens>(
    () => ({
      scheme: settings.scheme,
      colors: palettes[settings.scheme],
      spacing,
      radii,
      typography,
      shadows,
    }),
    [settings.scheme],
  );

  const isRTL = settings.language === 'fa';

  const value = useMemo<SettingsContextValue>(
    () => ({
      loaded,
      settings,
      isRTL,
      direction: isRTL ? 'rtl' : 'ltr',
      language: settings.language,
      setLanguage,
      scheme: settings.scheme,
      setScheme,
      toggleScheme,
      t: (key, params) => translate(settings.language, key, params),
      theme,
      transition,
      beginThemeTransition,
      endThemeTransition,
    }),
    [
      loaded,
      settings,
      isRTL,
      setLanguage,
      setScheme,
      toggleScheme,
      theme,
      transition,
      beginThemeTransition,
      endThemeTransition,
    ],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(Context);
  if (!value) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return value;
}

// Convenience hooks: components that only need one concern stay small.
export function useTheme(): ThemeTokens {
  return useSettings().theme;
}

export function useTranslation(): Pick<
  SettingsContextValue,
  'language' | 'isRTL' | 't' | 'setLanguage'
> {
  const {language, isRTL, t, setLanguage} = useSettings();
  return {language, isRTL, t, setLanguage};
}

export function useDirection(): 'rtl' | 'ltr' {
  return useSettings().direction;
}
