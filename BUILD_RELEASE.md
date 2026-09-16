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
