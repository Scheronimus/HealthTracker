import { emptyProfile, SCHEMA_VERSION } from './schema.js'
import { createWeightDemoMeasurements } from '../modules/weight/demo.js'
import { createBloodPressureDemoMeasurements } from '../modules/blood-pressure/demo.js'

function demoStore(measurements) { return { schemaVersion: SCHEMA_VERSION, measurements, profile: emptyProfile() } }

export function createIrregularDemoStore() { return demoStore(createWeightDemoMeasurements()) }
export function createBloodPressureDemoStore() { return demoStore(createBloodPressureDemoMeasurements()) }
export function createCombinedDemoStore() { return demoStore([...createWeightDemoMeasurements(), ...createBloodPressureDemoMeasurements()]) }
