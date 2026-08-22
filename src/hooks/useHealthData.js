import { useEffect, useMemo, useState } from 'react'
import { loadStore, saveStore } from '../data/storage.js'

export function useHealthData() {
  const [store, setStore] = useState(loadStore)
  useEffect(() => saveStore(store), [store])
  const measurements = useMemo(() => [...store.measurements].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)), [store])
  const add = (item) => setStore((current) => ({ ...current, measurements: [...current.measurements, item] }))
  const update = (item) => setStore((current) => ({ ...current, measurements: current.measurements.map((entry) => entry.id === item.id ? item : entry) }))
  const remove = (id) => setStore((current) => ({ ...current, measurements: current.measurements.filter((entry) => entry.id !== id) }))
  return { store, setStore, measurements, add, update, remove }
}
