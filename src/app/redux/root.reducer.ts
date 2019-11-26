import { combineReducers } from 'redux'

const rootReducer = combineReducers({})

export default rootReducer

export type AppState = ReturnType<typeof rootReducer>
