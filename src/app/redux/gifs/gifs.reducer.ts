import { ADD_GIFS, REMOVE_GIFS } from './gifs.action'

const INITIAL_STATE = {}

const GifsReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ADD_GIFS:
            return { ...state, ...action.payload }
        case REMOVE_GIFS:
            let newState = { ...state }
            action.payload.forEach(gifId => delete newState[gifId])
            return newState
        default:
            return state
    }
}

export default GifsReducer
