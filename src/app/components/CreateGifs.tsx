import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Grid, Tab, Typography, Box, Tabs, Theme, Button, CircularProgress, Divider } from '@material-ui/core'
import CreateForm from './CreateForm'
import PreviewGif from './PreviewGif'
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

interface TabPanelProps {
    children?: React.ReactNode
    index: any
    value: any
}

const useStyles = makeStyles((theme: Theme) => ({
    tabs: {
        paddingLeft: theme.spacing(2),
    },
    videoContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: 'fit-content',
        marginRight: '20px',
    },
    generateBtn: {
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        height: '49px',
    },
    giffingOverlay: {
        border: 'grey solid 1px',
        borderStyle: 'dashed',
        background: '#272727',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    counterOverlay: {
        display: 'flex',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.5)',
        fontSize: '20px',
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

const COUNTER_INTERVAL = 800

const CreateGifs = () => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const webcamRef = useRef(null)
    const [tabValue, setTabValue] = useState(0)
    const [previewSize, setPreviewSize] = useState({ width: 200, height: 200 })
    const [cameraState, setCameraState] = useCameraContext()
    const [counter, setCounter] = useState(3)
    const [counting, setCounting] = useState(false)
    const [giffing, setGiffing] = useState(false)

    const { pending, b64 } = useSelector(state => previewSelector(state))
    const { formValues, formErrors } = useSelector(state => formSelector(state))

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue)
    }

    const formSubmit = useCallback(async () => {
        let newDimensions = { width: webcamRef.current.video.videoWidth, height: webcamRef.current.video.videoHeight }
        setPreviewSize(newDimensions)
        setCounting(true)
        dispatch(pendingPreview(true))

        let interval = setInterval(() => setCounter(counter => counter - 1), COUNTER_INTERVAL)
        setTimeout(async () => {
            clearInterval(interval)
            setCounter(3)
            setCounting(false)

            if (Object.keys(formErrors).length === 0) {
                /**@todo Bigger dimensions take longer time, longer than the provided recording time */
                let newDimensions = {
                    gifHeight: webcamRef.current.video.videoHeight,
                    gifWidth: webcamRef.current.video.videoWidth,
                }
                console.log(newDimensions)
                let b64 = await generateGif({ formValues, ...newDimensions })
                setGiffing(false)
                dispatch(newPreview({ b64, properties: formValues }))
            }
        }, COUNTER_INTERVAL * 3)

        setTimeout(() => {
            if (giffing === false) {
                setGiffing(true)
            }
            dispatch(pendingPreview(false))
        }, COUNTER_INTERVAL * 7)
    }, [formValues])

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} lg={12}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="simple tabs example" className={classes.tabs}>
                    <Tab label="Webcam" {...a11yProps(0)} />
                    <Tab label="Video" {...a11yProps(1)} />
                </Tabs>
                <TabPanel value={tabValue} index={0}>
                    <CreateForm />
                    <Typography style={{ margin: '10px 16px' }} color="textSecondary" variant="subtitle2">
                        Dimensions adjusted to maintain camera aspect ratio.
                    </Typography>
                    {cameraState.loading ? (
                        <Typography style={{ margin: '10px 16px' }} color="textSecondary" variant="subtitle2">
                            Loading Camera ...
                        </Typography>
                    ) : (
                        ''
                    )}
                    <div style={{ marginLeft: '16px', display: 'flex' }}>
                        {counting ? (
                            <div
                                className={classes.counterOverlay}
                                style={{ width: previewSize.width, height: previewSize.height }}
                            >
                                {counter}
                            </div>
                        ) : (
                            ''
                        )}
                        {!counting && giffing ? (
                            <div
                                className={classes.giffingOverlay}
                                style={{ width: previewSize.width, height: previewSize.height }}
                            >
                                <CircularProgress></CircularProgress>
                            </div>
                        ) : (
                            ''
                        )}
                        {b64 && !pending ? (
                            <PreviewGif />
                        ) : (
                            <div className={classes.videoContainer}>
                                <Webcam
                                    ref={webcamRef}
                                    videoConstraints={{ width: formValues.gifWidth, height: formValues.gifHeight }}
                                    onUserMedia={() => {
                                        setCameraState({ on: false, loading: true })
                                        webcamRef.current.video.onplaying = () => {
                                            setCameraState({ on: true, loading: false })
                                        }
                                    }}
                                ></Webcam>
                                {cameraState.on ? (
                                    <Button
                                        className={classes.generateBtn}
                                        onClick={formSubmit}
                                        variant="outlined"
                                        color="default"
                                        disabled={pending}
                                    >
                                        Preview GIF
                                    </Button>
                                ) : (
                                    ''
                                )}
                            </div>
                        )}

                        {/* {camSize && webcamRef.current ? `${webcamRef.current.video.videoWidth}` : 'CAM NOT READY'} */}

                        {/* <PreviewGif /> */}
                    </div>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <Typography color="textSecondary" className={classes.tabs}>
                        Coming soon...
                    </Typography>
                </TabPanel>
            </Grid>
        </Grid>
    )
}

export default CreateGifs
