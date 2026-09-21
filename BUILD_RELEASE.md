# BUILD_RELEASE.md

## Release Principles

- Build and sign only from the project root.
- Verify the project root before every build, signing, or artifact operation.
- Keep keystores outside version control.
- Never commit passwords, signing keys, API keys, or local machine paths.
- Use a dedicated release key for the application.
- Document the secure backup and recovery process for the release key.
- Never use debug signing for a production or store-upload release.
- Verify application ID, version code, version name, app label, icon, and permissions before release.
- Record the exact build commands, environment, and artifact checks for every release candidate.

## Pre-release Checklist

- [ ] Release build uses the permanent release key.
- [ ] Debug logging is removed or disabled.
- [ ] No secrets exist in source code or generated artifacts.
- [ ] No sensitive message content is included in logs or notifications.
- [ ] Notification permission behavior is tested on supported Android versions.
- [ ] Locked message content is not exposed in notifications.
- [ ] App survives cold start and process restart.
- [ ] Scheduled notifications behave correctly after device restart when supported.
- [ ] RTL is checked on representative devices and screen sizes.
- [ ] English LTR layout is checked.
- [ ] Light and dark themes are checked.
- [ ] Accessibility labels, text scaling, and touch targets are checked.
- [ ] Offline behavior is verified.
- [ ] Persistence and message recovery are tested.
- [ ] Privacy statement is prepared and matches the implemented behavior.
- [ ] Store screenshots and Persian store description are prepared.
- [ ] Application ID and package configuration are verified.
- [ ] Version code and version name are verified.
- [ ] App label and launcher icon are verified.
- [ ] Merged manifest permissions are reviewed.
- [ ] Signed release artifact is installed on a clean device.
- [ ] Release artifact launches and works without development tooling.
- [ ] Upgrade from the previous version is tested when applicable.
- [ ] Release artifact integrity and signing certificate are verified.
- [ ] Store-specific technical and policy requirements are verified.
- [ ] Release notes and verification results are recorded.

## Bazaar and Myket

Check each store's current technical and policy requirements at submission time.

Do not hard-code assumptions about:

- Required Android API levels
- Target SDK requirements
- Signing formats
- Artifact formats
- Application IDs
- Screenshot dimensions
- Privacy declarations
- Content policies
- Required metadata
- Permission disclosures

Record the verified requirements and verification date in the release notes.

Before submission, confirm that:

- The package name is stable and correct.
- The release artifact is signed with the permanent release key.
- The version code is greater than the previously published version when applicable.
- The version name matches the intended release.
- Store metadata accurately describes the implemented functionality.
- Privacy statements match actual data handling and permissions.
- No unimplemented feature is advertised.

## Signing the Release Build

The release build must fail clearly when the required release signing configuration or keystore is missing.

**Do not silently fall back to debug signing for a release build.**

A placeholder keystore may be generated for local pipeline validation only. It must never be used for a production store upload.

Before any store submission:

- Generate the permanent release key.
- Store it securely outside version control.
- Configure the release signing properties locally or through a secure CI secret mechanism.
- Verify the signing certificate.
- Confirm that the release artifact is signed with the intended certificate.
- Keep the release keystore and passwords backed up securely.

If the project temporarily supports unsigned or debug-signed local validation, the resulting artifact must be clearly marked as non-production and must not be submitted to a store.

### Generate the Release Key (Once, Securely)

Run the following command from a secure location. Store the keystore in an approved secure location and configure the project to reference it without committing it.

```powershell
keytool -genkeypair -v -storetype PKCS12 `
  -keystore badabekhoon-release.keystore `
  -alias badabekhoon `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -dname "CN=Badabekhoon, OU=Release, O=Badabekhoon, C=IR"