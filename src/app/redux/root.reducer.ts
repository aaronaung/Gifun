import { combineReducers } from 'redux'
import PreviewReducer from './preview/preview.reducer'
import GifsReducer from './gifs/gifs.reducer'
import FormReducer from './form/form.reducer'

const rootReducer = combineReducers({
    preview: PreviewReducer,
    gifs: GifsReducer,
    form: FormReducer,
})

export default rootReducer

export type AppState = ReturnType<typeof rootReducer>
