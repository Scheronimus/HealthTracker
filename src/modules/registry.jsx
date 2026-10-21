import { MODULE_CATALOG } from './catalog.js'
import { weightModule } from './weight/index.jsx'
import { bloodPressureModule } from './blood-pressure/index.jsx'
import { goalsModule } from './goals/index.jsx'

const implementations = { weight: weightModule, bloodPressure: bloodPressureModule, goals: goalsModule }

export const MODULES = Object.freeze(MODULE_CATALOG.map((metadata) => Object.freeze({ ...metadata, ...implementations[metadata.id] })))
export const MODULES_BY_ID = Object.freeze(Object.fromEntries(MODULES.map((module) => [module.id, module])))
