import { createStyles, InputAdornment, makeStyles, MenuItem, TextField, Theme, Tooltip, Typography } from '@material-ui/core'
import VerticalAlignCenterIcon from '@material-ui/icons/VerticalAlignCenter'
import { Autocomplete } from '@material-ui/lab'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { resetForm, setFormErrors, updateFormValues } from '../redux/form/form.action'
import { formSelector } from '../redux/form/form.selector'
import { newPreview, pendingPreview } from '../redux/preview/preview.action'
import { previewSelector } from '../redux/preview/preview.selector'
import { generateGif } from '../services/gif.service'
import { debounce } from 'throttle-debounce'
import { useTabContext } from '../contexts/TabContext'

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
    gifWidth: (val, formValues) => !isNaN(val) && val >= 200,
    gifHeight: (val, formValues) => !isNaN(val) && val >= 200,
    fontSize: (val, formValues) => !isNaN(val),
    fontColor: (val, formValues) => /^#[0-9A-F]{6}$/i.test(val) || val === '',
    frameDuration: (val, formValues) => !isNaN(val) && val > 0,
    textXCoordinate: (val, formValues) => !isNaN(val) && val > 0 && val < formValues.gifWidth,
    textYCoordinate: (val, formValues) => !isNaN(val) && val > 0 && val < formValues.gifHeight,
}

const CreateForm = ({ tabIndex }) => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const xRef = useRef()
    const yRef = useRef()
    const [inputState, setInputState] = useState({ e: null, key: null })
    const { tabState } = useTabContext()
    const { pending } = useSelector(state => previewSelector(state))
    const { formValues, formErrors } = useSelector(state => formSelector(state))

    useEffect(() => {
        if (tabState === 1) {
            dispatch(updateFormValues({ frameDuration: 1 }))
        }
        return () => dispatch(resetForm())
    }, [])

    const updateForm = (value, key) => {
        let inputValue = value
        dispatch(updateFormValues({ [key]: value }))

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
    const debouncedUpdateForm = debounce(500, false, updateForm)
    const onInputChange = (e, key) => {
        let value = e.target.value
        debouncedUpdateForm(value, key)
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
                    id={`width-${tabIndex}`}
                    label="Width"
                    error={formErrors['gifWidth']}
                    helperText={formErrors['gifWidth'] ? 'Must be a number greater than or equal to 200' : ''}
                    onChange={e => onInputChange(e, 'gifWidth')}
                    defaultValue={300}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                />
                <TextField
                    id={`height-${tabIndex}`}
                    label="Height"
                    error={formErrors['gifHeight']}
                    helperText={formErrors['gifHeight'] ? 'Must be a number greater than or equal to 200' : ''}
                    onChange={e => onInputChange(e, 'gifHeight')}
                    defaultValue={300}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                />
                <hr style={{ border: 'none' }}></hr>
                <TextField
                    id={`text-${tabIndex}`}
                    label="Text"
                    error={formErrors['text']}
                    defaultValue="Hello World"
                    onChange={e => onInputChange(e, 'text')}
                />

                <TextField
                    id={`textPlacement-${tabIndex}`}
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
                    id={`xCoordinate-${tabIndex}`}
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
                                <Tooltip title={<Typography variant="subtitle2">Center Horizontally</Typography>}>
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
                    id={`yCoordinate-${tabIndex}`}
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
                                <Tooltip title={<Typography variant="subtitle2">Center Vertically</Typography>}>
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
                    id={`fontSize-${tabIndex}`}
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
                    id={`fontColor-${tabIndex}`}
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
                    id={`fontFamily-${tabIndex}`}
                    options={webSafeFonts}
                    getOptionLabel={option => option}
                    defaultValue="Arial"
                    onSelect={e => onInputChange(e, 'fontFamily')}
                    style={{ width: 200, display: 'inline-flex' }}
                    renderInput={params => <TextField {...params} label="Font Family" variant="outlined" fullWidth />}
                />
                <TextField
                    id={`fontWeight-${tabIndex}`}
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
                <hr style={{ border: 'none' }}></hr>
                {tabState === 1 ? (
                    <TextField
                        hidden={tabState === 0}
                        id={`frameDuration-${tabIndex}`}
                        label="Frame Duration"
                        error={formErrors['frameDuration']}
                        helperText={formErrors['frameDuration'] ? 'Must be a positive number' : ''}
                        onChange={e => onInputChange(e, 'frameDuration')}
                        defaultValue={1}
                        InputProps={{
                            endAdornment: <InputAdornment position="start">sec</InputAdornment>,
                        }}
                    />
                ) : (
                    ''
                )}
            </form>
        </div>
    )
}

export default CreateForm
