export const LAST_SEEN_RELEASE_KEY = 'health-tracker-last-seen-release'

export function shouldShowReleaseNotes(version, storage = localStorage) {
  return storage.getItem(LAST_SEEN_RELEASE_KEY) !== version
}

export function markReleaseNotesSeen(version, storage = localStorage) {
  storage.setItem(LAST_SEEN_RELEASE_KEY, version)
}
