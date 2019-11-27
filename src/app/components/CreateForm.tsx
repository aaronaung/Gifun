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
} from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { newPreview, pendingPreview } from '../redux/preview/preview.action'
import { generateGif } from '../services/gif.service'

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
            marginTop: theme.spacing(5),
        },
    })
)

const CreateForm = () => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const [formValues, setFormValues] = useState({ textBaseline: 'top' })
    const [errorStates, setErrorStates] = useState({})

    const onInputChange = (e, key) => {
        let inputValue = e.target.value
        setFormValues({ ...formValues, [key]: e.target.value })
        const validateFns = {
            gifWidth: val => !isNaN(val),
            gifHeight: val => !isNaN(val),
            fontSize: val => !isNaN(val),
            fontColor: val => /^#[0-9A-F]{6}$/i.test(val) || val === '',
        }
        if (validateFns[key]) {
            if (!validateFns[key](inputValue)) {
                setErrorStates({ ...errorStates, [key]: true })
            } else {
                delete errorStates[key]
                setErrorStates({ ...errorStates })
            }
        }
    }

    const formSubmit = useCallback(async () => {
        dispatch(pendingPreview(true))
        if (Object.keys(errorStates).length === 0) {
            let b64 = await generateGif(formValues)
            dispatch(newPreview(b64))
            dispatch(pendingPreview(false))
        }
    }, [formValues])

    return (
        <div>
            <form className={classes.root}>
                <TextField
                    id="standard-basic"
                    label="Width"
                    error={errorStates['gifWidth']}
                    helperText={errorStates['gifWidth'] ? 'Must be a number' : ''}
                    onChange={e => onInputChange(e, 'gifWidth')}
                />
                <TextField
                    id="standard-basic"
                    label="Height"
                    error={errorStates['gifHeight']}
                    helperText={errorStates['gifHeight'] ? 'Must be a number' : ''}
                    onChange={e => onInputChange(e, 'gifHeight')}
                />
                <TextField
                    id="standard-basic"
                    label="Text"
                    error={errorStates['text']}
                    onChange={e => onInputChange(e, 'text')}
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
                <TextField
                    id="standard-basic"
                    label="Font Size"
                    error={errorStates['fontSize']}
                    helperText={errorStates['fontSize'] ? 'Must be a number' : ''}
                    onChange={e => onInputChange(e, 'fontSize')}
                />
                <TextField
                    id="standard-basic"
                    label="Font Color"
                    error={errorStates['fontColor']}
                    helperText={errorStates['fontColor'] ? 'Invalid color hex value' : ''}
                    onChange={e => onInputChange(e, 'fontColor')}
                />
                <Button onClick={formSubmit} variant="outlined" color="default" className={classes.generateBtn}>
                    Generate Gif
                </Button>
            </form>
        </div>
    )
}

export default CreateForm
