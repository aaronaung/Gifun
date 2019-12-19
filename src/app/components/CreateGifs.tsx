import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
    Grid,
    Tab,
    Typography,
    Box,
    Tabs,
    Theme,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    Switch,
} from '@material-ui/core'
import CreateForm from './CreateForm'
import PreviewGif from './WebCamPreview'
import { makeStyles } from '@material-ui/styles'
import Webcam from 'react-webcam'
import { formSelector } from '../redux/form/form.selector'
import { useSelector, useDispatch } from 'react-redux'
import { previewSelector } from '../redux/preview/preview.selector'
import { flexbox } from '@material-ui/system'
import { pendingPreview, newPreview } from '../redux/preview/preview.action'
import { generateGif } from '../services/gif.service'
import { after } from 'eol'
import { CameraProvider, useCameraContext } from '../contexts/CameraContext'
import { isMobile } from 'react-device-detect'
import sorry from '../../images/sorry.gif'
import clsx from 'clsx'
import { useTabContext } from '../contexts/TabContext'
import DropzoneDialogExample from './Dropzone'
import MyDropzone from './Dropzone'

interface TabPanelProps {
    children?: React.ReactNode
    index: any
    value: any
}

const useStyles = makeStyles((theme: Theme) => ({
    tabs: {
        paddingLeft: theme.spacing(2),
        justifyContent: 'center',
    },
    sorryGif: {
        width: '100%',
        marginTop: 20,
        borderRadius: 5,
    },
}))

function a11yProps(index: any) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    }
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            <Box paddingTop={2}>{children}</Box>
        </Typography>
    )
}

const CreateGifs = props => {
    const classes = useStyles()
    const dispatch = useDispatch()
    /** State variables */
    const { tabState, setTabState } = useTabContext()
    const [files, setFiles] = useState([])

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue)
    }

    const handleDrop = droppedFiles => {
        setFiles(files => {
            return [...files, ...droppedFiles]
        })
    }

    return (
        <Grid container spacing={3} className={classes.main}>
            <Grid item xs={12} lg={12}>
                <TabPanel value={tabState} index={0}>
                    {isMobile ? (
                        <>
                            <Typography>
                                Because of technical limitations, the browser version of <b>GIFun</b> webcam feature is not
                                supported on mobile devices at the moment.
                            </Typography>
                            <img src={sorry} className={clsx(classes.sorryGif)}></img>
                        </>
                    ) : (
                        <Grid container style={{ width: '100vw', flexWrap: 'wrap' }}>
                            <Grid item xs={12} md={7} lg={7} style={{ marginBottom: '25px' }}>
                                <CreateForm />
                            </Grid>

                            {/* <Grid item xs={12} md={4} lg={4} style={{ paddingLeft: '16px' }}> */}
                            <PreviewGif />
                            {/* </Grid> */}
                        </Grid>
                    )}
                </TabPanel>
                <TabPanel value={tabState} style={{ margin: '0 20%' }} index={1}>
                    <MyDropzone handleDrop={handleDrop}></MyDropzone>
                    {/* {JSON.stringify(files)} */}
                    {/* <CreateForm></CreateForm> */}
                </TabPanel>
                <TabPanel value={tabState} index={2}>
                    <Typography color="textSecondary" className={classes.tabs}>
                        Coming soon...
                    </Typography>
                </TabPanel>
            </Grid>
        </Grid>
    )
}

export default CreateGifs
