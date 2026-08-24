# Technical debt

- `localStorage` is synchronous and appropriate for the initial data volume, but IndexedDB should be evaluated if measurements or attachment-like data grow substantially.
- Migration version 0 exists as the tested bootstrap path. Every future schema bump must add a sequential migration plus fixtures for valid, invalid, and partially migrated data.
- Automated tests focus on the highest-risk data boundary. Component accessibility and end-to-end PWA install/offline behavior still need browser automation.
- The service worker uses automatic updates. A future app with long-running unsaved forms should add an update-available flow before activation.
- Restore preserves collisions by ID but does not offer a manual conflict-resolution UI.
- Before expanding to roughly five or six health modules, complete a second modularity cleanup: namespace module-specific profile settings under `moduleSettings`, move module translations and styles into their owning folders, remove the concrete Weight/Blood Pressure compatibility exports from shared transfer code, and let modules register their demo-data capability through the catalog. Reconsider this work when planning the third module so the remaining shared-file coupling does not become the template for later modules.
- The bulk-delete control is intentionally temporary and development-only through `import.meta.env.DEV`; remove its UI, translations, and callback when demo-data testing is complete.
