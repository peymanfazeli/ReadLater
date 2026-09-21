import {I18nManager} from 'react-native';
import type {Language} from './translations';
import {languageIsRTL} from './translations';

export {
  DEFAULT_LANGUAGE,
  translations,
  english,
  translate,
  interpolate,
  languageIsRTL,
} from './translations';
export type {Language, TranslationKey} from './translations';

// Launch-time default: Persian is the default app language, so the natively
// cached layout direction is RTL on launch. The SettingsProvider applies the
// persisted language (and calls `applyRTLSetting`) once it loads, so an
// English selection is honored before any user interaction.
export function setupRTL() {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

// Called on language change so the native preference survives a restart and
// any native chrome (drawer edge, status bar) matches the active language.
// In-app layout flips live through the `direction` style set from the active
// language in App.tsx; this call keeps the native prefs in step.
export function applyRTLSetting(language: Language) {
  const rtl = languageIsRTL(language);
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(rtl);
}

export function isRTL(): boolean {
  return I18nManager.isRTL;
}

export function directionOf(language: Language): 'rtl' | 'ltr' {
  return languageIsRTL(language) ? 'rtl' : 'ltr';
}
