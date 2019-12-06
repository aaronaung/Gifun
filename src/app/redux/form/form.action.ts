export const UPDATE_FORM_VALUES = 'UPDATE_FORM_VALUES'
export const SET_FORM_ERRORS = 'SET_FORM_ERRORS'
export const RESET_FORM = 'RESET_FORM'
export const updateFormValues = formValues => {
    return {
        type: UPDATE_FORM_VALUES,
        payload: formValues,
    }
}

export const resetForm = () => {
    return {
        type: RESET_FORM,
        payload: '',
    }
}

export const setFormErrors = formErrors => {
    return {
        type: SET_FORM_ERRORS,
        payload: formErrors,
    }
}
