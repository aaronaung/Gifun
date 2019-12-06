import React, { useState, useCallback, useRef, useEffect } from 'react'
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
    Tooltip,
} from '@material-ui/core'
import VerticalAlignCenterIcon from '@material-ui/icons/VerticalAlignCenter'
import { Autocomplete } from '@material-ui/lab'
import { useDispatch, useSelector } from 'react-redux'
import { newPreview, pendingPreview } from '../redux/preview/preview.action'
import { generateGif } from '../services/gif.service'
import { previewSelector } from '../redux/preview/preview.selector'
import { formSelector } from '../redux/form/form.selector'
import { updateFormValues, updateFormErrors, setFormErrors, resetForm } from '../redux/form/form.action'

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

const webSafeFonts = [
    'Andale Mono',
    'Arial',
    'Arial Black',
    'Arial Narrow',
    'Arial Rounded MT Bold',
    'Avant Garde',
    'Baskerville',
    'Big Caslon',
    'Bodoni MT',
    'Book Antiqua',
    'Brush Script MT',
    'Calibri',
    'Calisto MT',
    'Cambria',
    'Candara',
    'Century Gothic',
    'Consolas',
    'Copperplate',
    'Courier New',
    'Didot',
    'Franklin Gothic Medium',
    'Futura',
    'Garamond',
    'Geneva',
    'Georgia',
    'Gill Sans',
    'Goudy Old Style',
    'Helvetica',
    'Hoefler Text',
    'Impact',
    'Lucida Bright',
    'Lucida Console',
    'Lucida Grande',
    'Lucida Sans Typewriter',
    'Monaco',
    'Optima',
    'Palatino',
    'Papyrus',
    'Perpetua',
    'Rockwell',
    'Rockwell Extra Bold',
    'Segoe UI',
    'Tahoma',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
]
/** maps field names to validation fns */

const formValidationFunctions = {
    gifWidth: (val, formValues) => !isNaN(val),
    gifHeight: (val, formValues) => !isNaN(val),
    fontSize: (val, formValues) => !isNaN(val),
    fontColor: (val, formValues) => /^#[0-9A-F]{6}$/i.test(val) || val === '',
    textXCoordinate: (val, formValues) => !isNaN(val) && val > 0 && val < formValues.gifWidth,
    textYCoordinate: (val, formValues) => !isNaN(val) && val > 0 && val < formValues.gifHeight,
}

const CreateForm = () => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const xRef = useRef()
    const yRef = useRef()

    const { pending } = useSelector(state => previewSelector(state))
    const { formValues, formErrors } = useSelector(state => formSelector(state))

    useEffect(() => {
        return () => dispatch(resetForm())
    }, [])

    const onInputChange = (e, key) => {
        let inputValue = e.target.value
        dispatch(updateFormValues({ [key]: e.target.value }))

        if (formValidationFunctions[key]) {
            if (!formValidationFunctions[key](inputValue, formValues)) {
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
                    defaultValue={300}
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
                    defaultValue={300}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                />
                <hr style={{ border: 'none' }}></hr>
                <TextField
                    id="standard-basic"
                    label="Text"
                    error={formErrors['text']}
                    defaultValue="Hello World"
                    onChange={e => onInputChange(e, 'text')}
                />

                <TextField
                    id="standard-select"
                    label="Text Placement"
                    select
                    className={classes.textField}
                    margin="normal"
                    variant="outlined"
                    SelectProps={{
                        MenuProps: {
                            className: classes.menu,
                        },
                    }}
                    defaultValue="custom"
                    onChange={e => {
                        onInputChange(e, 'textBaseline')
                        if (e.target.value !== 'custom') {
                            let newFormErrors = { ...formErrors }
                            delete newFormErrors['textXCoordinate']
                            delete newFormErrors['textXCoordinate']
                            dispatch(setFormErrors(newFormErrors))
                        }
                        /** Reset the x and y coordinate fields */
                        xRef.current.value = formValues.gifWidth / 2
                        yRef.current.value = formValues.gifHeight / 2
                        dispatch(
                            updateFormValues({
                                textXCoordinate: formValues.gifWidth / 2,
                                textYCoordinate: formValues.gifHeight / 2,
                            })
                        )
                    }}
                >
                    <MenuItem key={'top'} value={'top'}>
                        Top
                    </MenuItem>
                    <MenuItem key={'bottom'} value={'bottom'}>
                        Bottom
                    </MenuItem>
                    <MenuItem key={'custom'} value={'custom'}>
                        Custom
                    </MenuItem>
                </TextField>
                <TextField
                    id="standard-basic"
                    label="Text X-Coordinate"
                    error={formErrors['textXCoordinate']}
                    helperText={
                        formErrors['textXCoordinate']
                            ? `Must be a number greater than 0 and less than ${formValues.gifWidth}`
                            : ''
                    }
                    onChange={e => {
                        onInputChange(e, 'textXCoordinate')
                    }}
                    inputRef={xRef}
                    defaultValue={150}
                    style={formValues.textBaseline !== 'custom' ? { display: 'none' } : {}}
                    InputProps={{
                        endAdornment: (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <InputAdornment style={{ marginRight: '10px' }} position="end">
                                    px
                                </InputAdornment>
                                <Tooltip title="Center Horizontally">
                                    <VerticalAlignCenterIcon
                                        style={{ cursor: 'pointer', transform: 'rotate(90deg)' }}
                                        color="secondary"
                                        fontSize="small"
                                        onClick={() => {
                                            xRef.current.value = formValues.gifWidth / 2
                                            dispatch(
                                                updateFormValues({
                                                    textXCoordinate: formValues.gifWidth / 2,
                                                })
                                            )
                                        }}
                                    ></VerticalAlignCenterIcon>
                                </Tooltip>
                            </div>
                        ),
                    }}
                />

                <TextField
                    id="standard-basic"
                    label="Text Y-Coordinate"
                    error={formErrors['textYCoordinate']}
                    helperText={
                        formErrors['textYCoordinate']
                            ? `Must be a number greater than 0 and less than ${formValues.gifHeight}`
                            : ''
                    }
                    inputRef={yRef}
                    onChange={e => onInputChange(e, 'textYCoordinate')}
                    defaultValue={150}
                    style={formValues.textBaseline !== 'custom' ? { display: 'none' } : {}}
                    InputProps={{
                        endAdornment: (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <InputAdornment style={{ marginRight: '10px' }} position="end">
                                    px
                                </InputAdornment>
                                <Tooltip title="Center Vertically">
                                    <VerticalAlignCenterIcon
                                        style={{ cursor: 'pointer' }}
                                        color="secondary"
                                        fontSize="small"
                                        onClick={() => {
                                            yRef.current.value = formValues.gifHeight / 2
                                            dispatch(
                                                updateFormValues({
                                                    textYCoordinate: formValues.gifHeight / 2,
                                                })
                                            )
                                        }}
                                    ></VerticalAlignCenterIcon>
                                </Tooltip>
                            </div>
                        ),
                    }}
                />
                <hr style={{ border: 'none' }}></hr>
                <TextField
                    id="standard-basic"
                    label="Font Size"
                    error={formErrors['fontSize']}
                    helperText={formErrors['fontSize'] ? 'Must be a number' : ''}
                    onChange={e => onInputChange(e, 'fontSize')}
                    defaultValue={20}
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
                    defaultValue={'#ffffff'}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">HEX</InputAdornment>,
                    }}
                />
                <Autocomplete
                    id="fontFamily"
                    options={webSafeFonts}
                    getOptionLabel={option => option}
                    defaultValue="Arial"
                    onSelect={e => onInputChange(e, 'fontFamily')}
                    style={{ width: 200, display: 'inline-flex' }}
                    renderInput={params => <TextField {...params} label="Font Family" variant="outlined" fullWidth />}
                />
                <TextField
                    id="standard-select"
                    label="Font Weight"
                    select
                    className={classes.textField}
                    margin="normal"
                    variant="outlined"
                    SelectProps={{
                        MenuProps: {
                            className: classes.menu,
                        },
                    }}
                    defaultValue="normal"
                    onChange={e => {
                        onInputChange(e, 'fontWeight')
                    }}
                >
                    <MenuItem key={'lighter'} value={'lighter'}>
                        Lighter
                    </MenuItem>
                    <MenuItem key={'normal'} value={'normal'}>
                        Normal
                    </MenuItem>
                    <MenuItem key={'bold'} value={'bold'}>
                        Bold
                    </MenuItem>
                    <MenuItem key={'bolder'} value={'bolder'}>
                        Bolder
                    </MenuItem>
                </TextField>
            </form>
        </div>
    )
}

export default CreateForm
