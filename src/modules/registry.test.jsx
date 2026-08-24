import { describe, expect, it } from 'vitest'
import { DEFAULT_MODULES, MODULE_CATALOG, MODULE_DATA_BY_TYPE } from './catalog.js'
import { MODULES, MODULES_BY_ID } from './registry.jsx'

describe('module registry contract', () => {
  it('provides a complete implementation for every catalog module', () => {
    expect(MODULES.map(({ id }) => id)).toEqual(DEFAULT_MODULES)
    for (const metadata of MODULE_CATALOG) {
      const module = MODULES_BY_ID[metadata.id]
      expect(module).toMatchObject(metadata)
      expect(module.Dashboard).toBeTypeOf('function')
      expect(module.EntryForm).toBeTypeOf('function')
      expect(module.labels).toMatchObject({ add: expect.any(String), edit: expect.any(String), deleteConfirm: expect.any(String) })
      expect(MODULE_DATA_BY_TYPE[metadata.measurementType]?.validateMeasurement).toBeTypeOf('function')
      expect(MODULE_DATA_BY_TYPE[metadata.measurementType]?.csv.parse).toBeTypeOf('function')
    }
  })

  it('keeps module state defaults isolated', () => {
    expect(MODULES_BY_ID.weight.initialState).toEqual({ chartSpan: 'threeMonths' })
    expect(MODULES_BY_ID.bloodPressure.initialState).toEqual({ selectedWeek: null, view: 'overview' })
  })
})
