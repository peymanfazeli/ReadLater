# BUILD_RELEASE.md

## Release principles
- Build and sign only from the project root.
- Keep keystores outside version control.
- Never commit passwords, signing keys, API keys, or local machine paths.
- Use a dedicated release key for the app and document its secure backup process.
- Verify application ID, version code, version name, app label, icon, and permissions before release.

## Pre-release checklist
- [ ] Debug logging removed or disabled.
- [ ] No secrets in source or generated artifacts.
- [ ] Notification permission behavior tested.
- [ ] Locked message content is not exposed in notifications.
- [ ] App survives cold start and process restart.
- [ ] RTL checked on representative devices.
- [ ] Offline behavior checked.
- [ ] Privacy statement prepared.
- [ ] Store screenshots and Persian description prepared.
- [ ] Signed release artifact installed on a clean device.
- [ ] Upgrade from previous version tested when applicable.

## Bazaar and Myket
Check each store's current technical requirements at submission time. Do not hard-code assumptions about required API levels, signing formats, screenshots, privacy declarations, or content policies. Record the verified requirements and date in the release notes.

## Signing the release build
The release buildType reads `android/keystore.properties` when present and
falls back to debug signing when it or the keystore file is missing (keeps CI
green before the real key exists). A placeholder keystore was generated for
pipeline validation only — generate the permanent release key and secure it
before any store upload.

### Generate the release key (once, securely)
```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore badabekhoon-release.keystore `
  -alias badabekhoon -keyalg RSA -keysize 2048 -validity 10000 `
  -dname "CN=Badabekhoon, OU=Release, O=Badabekhoon, C=IR"
```
- Use a strong random password; back it up with the keystore file in at least
  two safe places. Losing it means losing the release identity — the store
  cannot re-sign your updates.
- Never commit the keystore or passwords. `android/keystore.properties` is
  gitignored.

### `android/keystore.properties` (gitignored)
```properties
storeFile=app/badabekhoon-release.keystore
storePassword=<password>
keyAlias=badabekhoon
keyPassword=<password>
```
`storeFile` is resolved via `rootProject.file(...)`, so it is relative to the
`android/` directory.

### Verify the built APK
```powershell
$bt = "$env:ANDROID_HOME\build-tools\<version>"
& "$bt\apksigner.bat" verify --print-certs android\app\build\outputs\apk\release\app-release.apk
& "$bt\aapt.exe" dump badging android\app\build\outputs\apk\release\app-release.apk
```
Check: app label «بعدابخون», `versionCode`/`versionName`, and that no
`INTERNET` / `ACCESS_NETWORK_STATE` permissions survive manifest merging.
Release APK (1.0.0): 53.94 MB, signed with the Badabekhoon key, offline-only
(only notification/clock permissions remain).

## Release notes copy (draft)
### Privacy statement
بعدابخون کاملاً آفلاین و محلی کار می‌کند. پیام‌ها فقط روی دستگاه شما
ذخیره می‌شوند و هرگز به سروری ارسال نمی‌شوند. این برنامه به اینترنت، حساب
کاربری یا موقعیت مکانی دسترسی ندارد، تبلیغات و آنالیتیکس ندارد، و هیچ
داده‌ای از شما جمع‌آوری نمی‌کند. محتوای پیام‌های قفل‌شده تا رسیدن زمان از
قفل درآیند، در هیچ‌جایی نمایش داده نمی‌شود.

### Store description
پیامی برای خودت بنویس، آینده بازش کن. بعدابخون یک پیام‌نویس خصوصی برای
نسخه‌ی آینده‌ی خودت است: متن خود را بنویس، یک روز و ساعت (شمسی) برای باز
شدن انتخاب کن، و برنامه پیام را تا همان لحظه قفل نگه می‌دارد و با اعلان به
تو یادآوری می‌کند.
- کاملاً محلی و آفلاین؛ پیام‌ها فقط روی دستگاه خودت می‌مانند
- بدون حساب کاربری، بدون تبلیغات، بدون جمع‌آوری داده
- انتخاب تاریخ و ساعت شمسی با تقویم راست‌به‌چپ فارسی
- پشتیبانی از باز شدن همان لحظه‌ای، روز بعد، یک هفته، یک ماه یا یک سال بعد
- اعلان محلی یادآور باز شدن پیام (حتی پس از ری‌استارت گوشی)
