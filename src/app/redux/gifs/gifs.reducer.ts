import { ADD_GIFS, REMOVE_GIFS } from './gifs.action'
import * as _ from 'lodash'

const INITIAL_STATE = []

const GifsReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ADD_GIFS:
            return [...state, ...action.payload]
        case REMOVE_GIFS:
            let newState = [...state]
            _.remove(newState, gif => _.includes(action.payload, gif.id))
            return newState
        default:
            return state
    }
}

export default GifsReducer
