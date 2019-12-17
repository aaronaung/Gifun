export const NEW_PREVIEW = 'NEW_PREVIEW'
export const REMOVE_PREVIEW = 'NEW_PREVIEW'
export const PENDING_PREVIEW = 'PENDING_PREVIEW'
export const MARK_PREVIEW_SAVED = 'MARK_PREVIEW_SAVED'

export const pendingPreview = pending => {
    return {
        type: PENDING_PREVIEW,
        payload: pending,
    }
}
export const newPreview = (preview: any) => {
    return {
        type: NEW_PREVIEW,
        payload: preview,
    }
}

export const removePreview = () => {
    return {
        type: REMOVE_PREVIEW,
        payload: '',
    }
}

export const setSaved = (saved, shareableLink) => {
    return {
        type: MARK_PREVIEW_SAVED,
        payload: { saved, shareableLink },
    }
}
