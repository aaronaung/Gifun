import { combineReducers } from 'redux'
import PreviewReducer from './preview/preview.reducer'

const rootReducer = combineReducers({
    preview: PreviewReducer,
})

export default rootReducer

export type AppState = ReturnType<typeof rootReducer>
