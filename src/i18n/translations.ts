export type Language = 'fa' | 'en';

// `fa` is the source of truth for the key set; `en` is type-checked to carry
// exactly the same keys so a missing translation is a compile error, not a
// runtime gap. Word order and idiom differ on purpose: both languages should
// read naturally rather than matching token-for-token.
export const translations = {
  fa: {
    appName: 'بعدابخون',

    // Navigation titles.
    screenCreate: 'پیام جدید',
    screenSettings: 'تنظیمات',
    screenLogin: 'ورود',
    screenReveal: 'پیام تو',

    // Home.
    'home.menuLabel': 'باز کردن منو',
    'home.subtitle': 'پیامی برای خودت بنویس، آینده بازش کن',
    'home.corruptNotice': 'برخی پیام‌ها قابل خواندن نبودند و حذف شدند',
    'home.emptyTitle': 'هنوز پیامی نداری',
    'home.emptyHint': 'اولین پیامت رو برای خودت بنویس',
    'home.newMessage': 'پیام جدید بنویس',
    'home.listError': 'بارگیری پیام‌ها با مشکل مواجه شد',

    // Message card.
    'message.locked': 'پیام قفل شده',
    'message.unlocked': 'پیام باز شده',
    'message.unlocksAt': 'باز می‌شود: {date}',
    'message.createdAt': 'ساخته شده: {date}',
    'message.statusWaiting': 'منتظر',
    'message.statusOpen': 'باز کن',

    // Create message.
    'create.subtitle': 'بنویس، بعداً برای خودت باز کن',
    'create.titleLabel': 'عنوان',
    'create.titlePlaceholder': 'مثلاً: یادداشتی برای خودم',
    'create.bodyLabel': 'پیام',
    'create.bodyPlaceholder': 'اینجا بنویس...',
    'create.unlockSection': 'زمان باز شدن',
    'create.unlocksPreview': 'باز می‌شود: {date}',
    'create.pastWarning': 'زمان باز شدن باید در آینده باشد',
    'create.save': 'ذخیره پیام',
    'create.saveFailed': 'ذخیره پیام با خطا مواجه شد',

    // Unlock quick picks and hours.
    'quick.tomorrow': 'فردا',
    'quick.week': '۱ هفته بعد',
    'quick.month': '۱ ماه بعد',
    'quick.year': '۱ سال بعد',
    'hours.9': '۹:۰۰ صبح',
    'hours.12': '۱۲:۰۰ ظهر',
    'hours.17': '۱۷:۰۰ عصر',
    'hours.21': '۲۱:۰۰ شب',
    'minutes.decreaseFive': 'کم کردن ۵ دقیقه',
    'minutes.decreaseOne': 'کم کردن ۱ دقیقه',
    'minutes.increaseOne': 'افزودن ۱ دقیقه',
    'minutes.increaseFive': 'افزودن ۵ دقیقه',
    'picker.previousMonth': 'ماه قبل',
    'picker.nextMonth': 'ماه بعد',

    // Validation (title and body are validated independently).
    'validation.titleRequired': 'عنوان لازم است',
    'validation.titleTooLong': 'عنوان خیلی طولانی است',
    'validation.bodyRequired': 'لطفاً پیامی بنویسید',
    'validation.bodyTooLong': 'پیام خیلی طولانی است',
    'validation.invalidUnlockAt': 'تاریخ باز شدن نامعتبر است',

    // Reveal.
    'reveal.lockedLabel': 'این پیام هنوز قفل است',
    'reveal.unlocksAt': 'باز می‌شود: {date}',
    'reveal.createdOn': 'نوشته شده: {date}',
    'reveal.unlockedOn': 'باز شده: {date}',
    'reveal.notFound': 'پیام پیدا نشد',
    'reveal.loadError': 'بارگیری پیام با مشکل مواجه شد',
    'reveal.copy': 'کپی متن',
    'reveal.copied': 'کپی شد',
    'reveal.delete': 'حذف پیام',
    'reveal.deleteConfirmTitle': 'حذف پیام',
    'reveal.deleteConfirmBody': 'این پیام برای همیشه حذف می‌شود. مطمئنی؟',

    // Generic states and actions.
    'errors.generic': 'خطایی پیش آمد',
    'actions.retry': 'تلاش دوباره',
    'actions.cancel': 'انصراف',
    'actions.delete': 'حذف',
    'actions.back': 'بازگشت',
    'actions.backHome': 'بازگشت به خانه',

    // Settings.
    'settings.notifications': 'اعلان‌ها',
    'settings.reminderTitle': 'یادآوری باز شدن پیام‌ها',
    'settings.reminderHint':
      'با فعال بودن اعلان، وقتی زمان باز شدن پیام فرا برسد در جریان قرار می‌گیری.',
    'settings.enabled': 'اعلان‌ها فعال است',
    'settings.enable': 'فعال کردن اعلان‌ها',
    'settings.languageSection': 'زبان',
    'settings.themeSection': 'ظاهر',
    'theme.light': 'حالت روشن',
    'theme.dark': 'حالت تاریک',

    // Drawer.
    'drawer.login': 'ورود',
    'drawer.settings': 'تنظیمات',
    'drawer.theme': 'ظاهر',
    'drawer.themeHint': 'برای تغییر ظاهر بزن',

    // Login (accounts are out of scope for the MVP).
    'login.comingSoon': 'ارتباط با حساب کاربری به‌زودی اضافه می‌شود.',

    // Notifications.
    'notification.channelName': 'باز شدن پیام‌ها',
    'notification.title': 'بعدابخون',
    'notification.body': 'پیام تو آماده‌ی خواندن شده است',

    // Accessibility.
    'attention.notEnabled': 'اعلان‌ها فعال نیست',
  },
} as const;

export type TranslationKey = keyof typeof translations.fa;

// English must declare every Persian key. The object literal itself is the
// check: an extra or missing key is a compile error.
export const english: Record<TranslationKey, string> = {
  appName: 'Badabekhoon',

  screenCreate: 'New message',
  screenSettings: 'Settings',
  screenLogin: 'Sign in',
  screenReveal: 'Your message',

  'home.menuLabel': 'Open menu',
  'home.subtitle': 'Write a note to yourself and open it in the future',
  'home.corruptNotice': 'Some messages could not be read and were removed',
  'home.emptyTitle': 'No messages yet',
  'home.emptyHint': 'Write your first message to yourself',
  'home.newMessage': 'Write a message',
  'home.listError': 'Could not load your messages',

  'message.locked': 'Locked message',
  'message.unlocked': 'Open message',
  'message.unlocksAt': 'Opens on: {date}',
  'message.createdAt': 'Created: {date}',
  'message.statusWaiting': 'Locked',
  'message.statusOpen': 'Open',

  'create.subtitle': 'Write it now, open it later',
  'create.titleLabel': 'Title',
  'create.titlePlaceholder': 'e.g. A note to myself',
  'create.bodyLabel': 'Message',
  'create.bodyPlaceholder': 'Write here...',
  'create.unlockSection': 'Unlock time',
  'create.unlocksPreview': 'Opens on: {date}',
  'create.pastWarning': 'The unlock time must be in the future',
  'create.save': 'Save message',
  'create.saveFailed': 'Could not save your message',

  'quick.tomorrow': 'Tomorrow',
  'quick.week': '1 week',
  'quick.month': '1 month',
  'quick.year': '1 year',
  'hours.9': '9:00 AM',
  'hours.12': '12:00 PM',
  'hours.17': '5:00 PM',
  'hours.21': '9:00 PM',
  'minutes.decreaseFive': 'Decrease by 5 minutes',
  'minutes.decreaseOne': 'Decrease by 1 minute',
  'minutes.increaseOne': 'Increase by 1 minute',
  'minutes.increaseFive': 'Increase by 5 minutes',
  'picker.previousMonth': 'Previous month',
  'picker.nextMonth': 'Next month',

  'validation.titleRequired': 'Title is required',
  'validation.titleTooLong': 'Title is too long',
  'validation.bodyRequired': 'Please write a message',
  'validation.bodyTooLong': 'Message is too long',
  'validation.invalidUnlockAt': 'The unlock time is not valid',

  'reveal.lockedLabel': 'This message is still locked',
  'reveal.unlocksAt': 'Opens on: {date}',
  'reveal.createdOn': 'Written on: {date}',
  'reveal.unlockedOn': 'Opened on: {date}',
  'reveal.notFound': 'Message not found',
  'reveal.loadError': 'Could not load this message',
  'reveal.copy': 'Copy text',
  'reveal.copied': 'Copied',
  'reveal.delete': 'Delete message',
  'reveal.deleteConfirmTitle': 'Delete message',
  'reveal.deleteConfirmBody':
    'This message will be deleted forever. Are you sure?',

  'errors.generic': 'Something went wrong',
  'actions.retry': 'Try again',
  'actions.cancel': 'Cancel',
  'actions.delete': 'Delete',
  'actions.back': 'Back',
  'actions.backHome': 'Back to home',

  'settings.notifications': 'Notifications',
  'settings.reminderTitle': 'Message unlock reminders',
  'settings.reminderHint':
    'When notifications are on, you will be told when a message unlocks.',
  'settings.enabled': 'Notifications are on',
  'settings.enable': 'Turn on notifications',
  'settings.languageSection': 'Language',
  'settings.themeSection': 'Appearance',
  'theme.light': 'Light mode',
  'theme.dark': 'Dark mode',

  'drawer.login': 'Sign in',
  'drawer.settings': 'Settings',
  'drawer.theme': 'Appearance',
  'drawer.themeHint': 'Tap to switch appearance',

  'login.comingSoon': 'Sign-in with an account will arrive soon.',

  'notification.channelName': 'Message unlocks',
  'notification.title': 'Badabekhoon',
  'notification.body': 'A message of yours is ready to read',

  'attention.notEnabled': 'Notifications are off',
};

export const DEFAULT_LANGUAGE: Language = 'fa';

export function languageIsRTL(language: Language): boolean {
  return language === 'fa';
}

export function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

// Looks up a key for a language with a safe chain: active language, Persian
// fallback (so an untranslated new key degrades gracefully), then the key
// itself. Params are interpolated as {name}.
export function translate(
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const table: Record<TranslationKey, string> =
    language === 'fa' ? translations.fa : english;
  const template = table[key] ?? translations.fa[key] ?? key;
  return interpolate(template, params);
}
