export async function shareAppLink(navigatorApi, payload) {
  try {
    if (navigatorApi.share) {
      await navigatorApi.share(payload)
      return 'shared'
    }
    if (navigatorApi.clipboard?.writeText) {
      await navigatorApi.clipboard.writeText(payload.url)
      return 'copied'
    }
    return 'unavailable'
  } catch (error) {
    return error?.name === 'AbortError' ? 'cancelled' : 'unavailable'
  }
}
