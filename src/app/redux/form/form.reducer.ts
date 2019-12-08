import { UPDATE_FORM_VALUES, SET_FORM_ERRORS, RESET_FORM } from './form.action'

const INITIAL_STATE = {
    formValues: {
        textBaseline: 'custom',
        textXCoordinate: 150,
        textYCoordinate: 150,
        gifHeight: 300,
        gifWidth: 300,
        fontSize: 20,
        fontColor: '#ffffff',
        text: 'Hello World',
        fontFamily: 'Arial',
        fontWeight: 'normal',
    },
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
        case RESET_FORM:
            return INITIAL_STATE
        default:
            return {
                ...state,
            }
    }
}

export default FormReducer
