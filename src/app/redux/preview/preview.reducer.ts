import { NEW_PREVIEW, REMOVE_PREVIEW, PENDING_PREVIEW } from './preview.action'

const INITIAL_STATE = {
    b64: '',
}
const PreviewReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case NEW_PREVIEW:
            return {
                ...state,
                b64: action.payload.b64,
                properties: action.payload.properties,
            }
        case REMOVE_PREVIEW:
            return {
                ...state,
                b64: null,
                properties: null,
            }
        case PENDING_PREVIEW:
            return {
                ...state,
                pending: action.payload,
            }
        default:
            return {
                ...state,
            }
    }
}

export default PreviewReducer
