import { NEW_PREVIEW, REMOVE_PREVIEW, PENDING_PREVIEW, MARK_PREVIEW_SAVED } from './preview.action'

const INITIAL_STATE = {
    b64: '',
    saved: false,
    shareableLink: '',
    pending: false,
    properties: {},
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
                b64: null,
                properties: null,
                saved: false,
                shareableLink: '',
            }
        case PENDING_PREVIEW:
            return {
                ...state,
                pending: action.payload,
            }
        case MARK_PREVIEW_SAVED:
            return {
                ...state,
                saved: action.payload.saved,
                shareableLink: action.payload.shareableLink,
            }
        default:
            return {
                ...state,
            }
    }
}

export default PreviewReducer
