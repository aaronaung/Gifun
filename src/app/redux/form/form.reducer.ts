import { UPDATE_FORM_VALUES, SET_FORM_ERRORS } from './form.action'

const INITIAL_STATE = {
    formValues: { textBaseline: 'top', gifHeight: 200, gifWidth: 200 },
    formErrors: {},
}

const FormReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case UPDATE_FORM_VALUES:
            return {
                formValues: { ...state.formValues, ...action.payload },
                formErrors: state.formErrors,
            }
        case SET_FORM_ERRORS:
            return {
                formValues: state.formValues,
                formErrors: action.payload,
            }
        default:
            return {
                ...state,
            }
    }
}

export default FormReducer
