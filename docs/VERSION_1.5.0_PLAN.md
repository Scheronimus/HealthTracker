# Health Tracker v1.5.0 plan

Status: Planned on `feature/v1.5.0-native-sharing`; native app sharing is implemented and confirmed as required release scope.

Version 1.5.0 will improve how people share the public Health Tracker application with another device. The existing QR code remains available, and a conventional share button directly below it opens the device's native share sheet. No health measurements, profile information, or other locally stored data are shared.

## Confirmed scope

### Native app sharing

Native app sharing is a committed requirement for v1.5.0:

- Keep the expandable sharing area and production-app QR code in Settings.
- Place a clearly labeled share button directly below the QR image.
- Share only the public production URL, a localized description, and the localized app name through the Web Share API.
- Do not read, serialize, upload, or attach health data, backups, profile details, preferences, or local-storage content.
- Treat cancellation of the native share sheet as a normal outcome without an error message.
- When native sharing is unavailable, copy the production URL to the clipboard when permitted and announce success in an accessible status message.
- When neither sharing nor clipboard access is available, direct the user to the visible production link already shown below the button.
- Keep English, Spanish, German, and French behavior and wording equivalent.
- Keep the product name `Health Tracker` untranslated inside the localized shared message.
- Preserve offline and installable behavior. Native sharing itself requires browser support and a secure context, normally the deployed HTTPS application.

The prototype was manually confirmed on iOS through a temporary HTTPS tunnel. Plain HTTP LAN development addresses are not valid Web Share API tests because they are not secure contexts.

## Remaining release planning

Any additional v1.5.0 features must be agreed separately before being added to this plan. Native sharing must remain in the release even if other scope is added. Release preparation will update version metadata and the localized “What’s new” notice after the complete scope is known.

No persisted data-shape change, schema migration, backend, account, analytics, telemetry, or external health integration is expected for this feature.

## Implementation areas

- `src/components/Settings.jsx`: native sharing, clipboard fallback, and accessible feedback.
- `src/components/shareApp.js`: testable Web Share API and clipboard capability handling.
- `src/App.css`: responsive share-button and icon styling.
- `src/i18n.js`: equivalent sharing labels, share text, and fallback feedback in all four languages.
- `src/components/Settings.test.jsx`: localized rendering and placement beneath the QR code.
- `docs/TESTING.md`: browser and device-level sharing regression steps.

## Verification

Run all standard checks:

```sh
npm test
npm run lint
npm run build
git diff --check
```

Before release, manually verify:

- the share button appears immediately below the QR code in all four languages;
- iOS Safari and an installed iOS PWA open the native share sheet from the deployed HTTPS application;
- supported Android and desktop browsers open their native share UI;
- cancelling the share sheet produces no error;
- unsupported browsers copy the URL when clipboard access is available and announce that result;
- browsers with neither capability display the localized fallback while retaining the visible, selectable production link;
- the shared payload contains only the app name, description, and exact production URL;
- narrow layouts, keyboard focus, touch interaction, light mode, and dark mode remain usable;
- the QR code still resolves to the same production URL;
- a production build remains installable and usable offline after its first successful load.

## Release acceptance criteria

Version 1.5.0 is ready when:

- native app sharing is included and works from the deployed HTTPS application;
- sharing never includes locally stored health or profile data;
- fallback behavior is understandable and accessible;
- all four interfaces remain functionally equivalent;
- release metadata and localized release notes describe the final agreed scope;
- all automated checks and relevant manual regression checks pass;
- `release/1.5.0` is prepared from `develop` only after this feature branch is reviewed and integrated.
