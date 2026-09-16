# بعدابخون (Badabekhoon)

پروژه موبایلی «بعدابخون» — یک اپ محلی و خصوصی برای نوشتن پیام به خود آینده و باز کردن آن در تاریخ مشخص.

## تصمیم‌های فعلی
- React Native CLI
- Android-first
- TypeScript
- انتشار هدف: کافه‌بازار و مایکت
- معماری local-first و privacy-first
- بدون حساب کاربری، backend، social features یا analytics در MVP

## Environment versions
- **Node.js:** 18.20.4
- **npm:** 10.7.0
- **Java/JDK:** 17.0.12 (HotSpot)
- **React Native:** 0.77.3
- **Gradle:** 8.10.2 (wrapper)
- **Android SDK:** compileSdk 35, targetSdk 34, minSdk 24
- **Build tools:** 35.0.0
- **NDK:** 27.1.12297006
- **Kotlin:** 2.0.21

## Baseline commands
```bash
npm run lint        # ESLint
npm run typecheck  # TypeScript typecheck (tsc --noEmit)
npm test            # Jest unit tests
cd android && ./gradlew.bat assembleDebug   # Android debug APK
```

## ترتیب مطالعه
1. `AGENTS.md`
2. `PLAN.md`
3. `ARCHITECTURE.md`
4. `DESIGN.md`
5. `SETUP.md`
6. `PROMPT_BIG_PICKLE.md`
7. `BUILD_RELEASE.md`
