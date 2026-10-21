import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadStore, saveStore } from '../data/storage.js'
import { reconcileStore } from '../data/modules.js'
import { localDateValue } from '../utils/date.js'

export function useHealthData() {
  const [store, writeStore] = useState(() => reconcileStore(loadStore()))
  const [calendarDay, setCalendarDay] = useState(() => localDateValue())
  const setStore = useCallback((update) => writeStore((current) => reconcileStore(typeof update === 'function' ? update(current) : update)), [])
  useEffect(() => saveStore(store), [store])
  useEffect(() => {
    let timeout
    function refresh() {
      setCalendarDay(localDateValue())
      setStore((current) => current)
      window.clearTimeout(timeout)
      const now = new Date(), midnight = new Date(now)
      midnight.setHours(24, 0, 0, 100)
      timeout = window.setTimeout(refresh, midnight.getTime() - now.getTime())
    }
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 100)
    timeout = window.setTimeout(refresh, midnight.getTime() - Date.now())
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => { window.clearTimeout(timeout); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh) }
  }, [setStore])
  const measurements = useMemo(() => [...store.measurements].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)), [store])
  const add = (item, key = 'measurements') => setStore((current) => ({ ...current, [key]: [...current[key], item] }))
  const update = (item, key = 'measurements') => setStore((current) => ({ ...current, [key]: current[key].map((entry) => entry.id === item.id ? item : entry) }))
  const remove = (id, key = 'measurements') => setStore((current) => ({ ...current, [key]: current[key].filter((entry) => entry.id !== id) }))
  return { store, setStore, measurements, add, update, remove, calendarDay }
}
