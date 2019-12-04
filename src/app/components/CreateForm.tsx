import React, { useState, useCallback } from 'react'
import {
    TextField,
    makeStyles,
    createStyles,
    Theme,
    FormControl,
    MenuItem,
    Divider,
    FormGroup,
    Typography,
    Button,
    InputAdornment,
} from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { newPreview, pendingPreview } from '../redux/preview/preview.action'
import { generateGif } from '../services/gif.service'
import { previewSelector } from '../redux/preview/preview.selector'
import { formSelector } from '../redux/form/form.selector'
import { updateFormValues, updateFormErrors, setFormErrors } from '../redux/form/form.action'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            '& > *': {
                margin: theme.spacing(2),
                width: 200,
            },
        },
        menu: {
            width: 200,
        },
        generateBtn: {
            marginTop: theme.spacing(4),
        },
    })
)

//maps field names to validation fns
const formValidationFunctions = {
    gifWidth: val => !isNaN(val),
    gifHeight: val => !isNaN(val),
    fontSize: val => !isNaN(val),
    fontColor: val => /^#[0-9A-F]{6}$/i.test(val) || val === '',
}

const CreateForm = () => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const { pending } = useSelector(state => previewSelector(state))
    const { formValues, formErrors } = useSelector(state => formSelector(state))

    const onInputChange = (e, key) => {
        let inputValue = e.target.value
        dispatch(updateFormValues({ [key]: e.target.value }))

        if (formValidationFunctions[key]) {
            if (!formValidationFunctions[key](inputValue)) {
                dispatch(setFormErrors({ ...formErrors, [key]: true }))
            } else {
                let newFormErrors = { ...formErrors }
                delete newFormErrors[key]
                dispatch(setFormErrors(newFormErrors))
            }
        }
    }

    const formSubmit = useCallback(async () => {
        dispatch(pendingPreview(true))
        if (Object.keys(formErrors).length === 0) {
            let b64 = await generateGif(formValues)
            dispatch(newPreview({ b64, properties: formValues }))
            dispatch(pendingPreview(false))
        }
    }, [formValues])

    return (
        <div>
            <form className={classes.root}>
                <TextField
                    id="standard-basic"
                    label="Width"
                    error={formErrors['gifWidth']}
                    helperText={formErrors['gifWidth'] ? 'Must be a number' : ''}
                    onChange={e => onInputChange(e, 'gifWidth')}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                />
                <TextField
                    id="standard-basic"
                    label="Height"
                    error={formErrors['gifHeight']}
                    helperText={formErrors['gifHeight'] ? 'Must be a number' : ''}
                    onChange={e => onInputChange(e, 'gifHeight')}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                />
                <hr style={{ border: 'none' }}></hr>
                <TextField id="standard-basic" label="Text" error={formErrors['text']} onChange={e => onInputChange(e, 'text')} />
                <TextField
                    id="standard-basic"
                    label="Font Size"
                    error={formErrors['fontSize']}
                    helperText={formErrors['fontSize'] ? 'Must be a number' : ''}
                    onChange={e => onInputChange(e, 'fontSize')}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                />
                <TextField
                    id="standard-basic"
                    label="Font Color"
                    error={formErrors['fontColor']}
                    helperText={formErrors['fontColor'] ? 'Invalid color hex value' : ''}
                    onChange={e => onInputChange(e, 'fontColor')}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">HEX</InputAdornment>,
                    }}
                />
                <TextField
                    id="standard-select"
                    label="Text Baseline"
                    select
                    className={classes.textField}
                    margin="normal"
                    variant="outlined"
                    SelectProps={{
                        MenuProps: {
                            className: classes.menu,
                        },
                    }}
                    defaultValue="top"
                    onChange={e => onInputChange(e, 'textBaseline')}
                >
                    <MenuItem key={'top'} value={'top'}>
                        Top
                    </MenuItem>
                    <MenuItem key={'bottom'} value={'bottom'}>
                        Bottom
                    </MenuItem>
                </TextField>
                {/* <Button
                    onClick={formSubmit}
                    variant="outlined"
                    color="default"
                    disabled={pending}
                    className={classes.generateBtn}
                >
                    Generate GIF
                </Button> */}
            </form>
        </div>
    )
}

export default CreateForm
