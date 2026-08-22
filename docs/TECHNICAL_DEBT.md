# Technical debt

- `localStorage` is synchronous and appropriate for the initial data volume, but IndexedDB should be evaluated if measurements or attachment-like data grow substantially.
- Migration version 0 exists as the tested bootstrap path. Every future schema bump must add a sequential migration plus fixtures for valid, invalid, and partially migrated data.
- Automated tests focus on the highest-risk data boundary. Component accessibility and end-to-end PWA install/offline behavior still need browser automation.
- The service worker uses automatic updates. A future app with long-running unsaved forms should add an update-available flow before activation.
- Restore preserves collisions by ID but does not offer a manual conflict-resolution UI.
