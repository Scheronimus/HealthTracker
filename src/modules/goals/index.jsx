import { GoalsDashboard } from './GoalsDashboard.jsx'
import { GoalsEntryForm } from './GoalsEntryForm.jsx'

export const goalsModule = Object.freeze({
  id: 'goals', Dashboard: GoalsDashboard, EntryForm: GoalsEntryForm,
  initialState: Object.freeze({ selectedId: null, arranging: false, entryDraft: null }),
  prepareEntryState: (state) => ({ ...state, entryDraft: null }),
  canAdd: (records) => records.length < 2,
  canSubmitEntry: ({ state, editing, sources, preset }) => (state.entryDraft?.kind ?? editing?.kind ?? preset?.kind) !== 'weight' || Boolean(sources.weight.observations.length || editing),
  labels: Object.freeze({ add: 'goal_add', edit: 'goal_edit', deleteConfirm: 'goal_deleteConfirm' }),
})
