import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    Switch,
    Theme,
    Tooltip,
    Typography,
    Grid,
} from '@material-ui/core'
import Button from '@material-ui/core/Button'
import InfoIcon from '@material-ui/icons/Info'
import { makeStyles } from '@material-ui/styles'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Webcam from 'react-webcam'
import { useCameraContext } from '../contexts/CameraContext'
import { useSnackbarContext } from '../contexts/SnackbarContext'
import { formSelector } from '../redux/form/form.selector'
import { newPreview, pendingPreview } from '../redux/preview/preview.action'
import { previewSelector } from '../redux/preview/preview.selector'
import { generateGif, generateGifOnMobile } from '../services/gif.service'
import PreviewCard from './PreviewCard'
import Loading from './Loader'
import TextPreview from './TextPreview'
import { isMobile } from 'react-device-detect'
import CreateForm from './CreateForm'

const useStyles = makeStyles((theme: Theme) => ({
    title: {
        marginBottom: theme.spacing(3),
    },
    topBar: {
        marginBottom: '5px',
        display: 'flex',
        alignItems: 'center',
    },
    actionBtn: {
        minWidth: '35px',
        cursor: 'pointer',
        '& .MuiSvgIcon-root': {
            fontSize: 30,
            color: theme.colors.default,
        },
    },
    previewSkeleton: {
        border: 'grey solid 1px',
        borderStyle: 'dashed',
        background: '#272727',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: 'fit-content',
        marginRight: '20px',
        minWidth: 300,
        minHeight: 300,
    },
    textPlacementOverlay: {
        position: 'absolute',
    },
    generateBtn: {
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        height: '50px',
    },
    'video::-webkit-media-controls-overlay-play-button': {
        display: 'none',
    },
    counterOverlay: {
        display: 'flex',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.5)',
        fontSize: '25px',
        zIndex: 10,
    },
    startGiffing: {
        color: theme.palette.secondary.main,
    },
    downloadBtn: {
        '&:hover .MuiSvgIcon-root': {
            color: `${theme.colors.success} !important`,
        },
    },
    cancelBtn: {
        '&:hover .MuiSvgIcon-root': {
            color: `${theme.colors.danger} !important`,
        },
    },
    favoriteBtn: {
        '&:hover .MuiSvgIcon-root': {
            color: `${theme.palette.secondary.main} !important`,
        },
    },
    savingOverlay: {
        opacity: 0.2,
    },
    savingLoader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        color: theme.palette.secondary.main,
        animation: 'none',
    },
    shareBtn: {
        '&:hover .MuiSvgIcon-root': {
            color: `white !important`,
        },
    },
}))

const COUNTER_INTERVAL = 800
const PREVIEW_GUIDE = [
    `Preview text placement by toggling the "Show text placement" switch.`,
    `Customize text placement by changing "Text Placement" to "Custom". `,
]

function PreviewGuideDialog({ open, setOpen }) {
    const classes = useStyles()

    return (
        <Dialog aria-labelledby="dialog" open={open} onBackdropClick={() => setOpen(false)}>
            <DialogTitle id="dialog">Note</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    The camera dimensions are auto-adjusted to keep the aspect ratio and achieve the best quality GIF. The width
                    and height inputs may/may not exactly define the preview dimensions; nevertheless, we've employed the best
                    possible calculations to keep the dimensions closest to the inputs.
                </DialogContentText>
                {/* <Divider></Divider> */}
                <DialogContentText id="alert-dialog-description">
                    Don't be afraid to play around with <b>Text placements</b> and <b>Font settings</b>!
                </DialogContentText>
            </DialogContent>
        </Dialog>
    )
}

export default function WebcamPreview() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const webcamRef = useRef(null)

    /** State variables */
    const [previewSize, setPreviewSize] = useState({ width: 300, height: 300 })
    const [camLoading, setCamLoading] = useState(true)
    const { openSnackbar } = useSnackbarContext()
    const [counter, setCounter] = useState(3)
    const [showText, setShowText] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [previewState, setPreviewState] = useState({ counting: false, recording: false })
    /** Redux store values */

    const { pending, b64, properties } = useSelector(state => previewSelector(state))
    const { formValues, formErrors } = useSelector(state => formSelector(state))

    useEffect(() => {
        if (webcamRef.current) {
            let newDimensions = { width: webcamRef.current.video.videoWidth, height: webcamRef.current.video.videoHeight }
            setPreviewSize(newDimensions)
        }
    }, [formValues.gifWidth, formValues.gifHeight])

    const formSubmit = useCallback(async () => {
        if (Object.keys(formErrors).length === 0) {
            setPreviewState({ counting: true, recording: false })
            dispatch(pendingPreview(true))

            let interval = setInterval(() => setCounter(counter => counter - 1), COUNTER_INTERVAL)
            setTimeout(async () => {
                clearInterval(interval)
                setCounter(3)
                setPreviewState({ counting: false, recording: true })
                let newProps = {
                    ...formValues,
                    gifHeight: webcamRef.current.video.videoHeight,
                    gifWidth: webcamRef.current.video.videoWidth,
                }
                let b64 = ''
                try {
                    if (isMobile) {
                        let videoElement = webcamRef.current.video
                        b64 = await generateGifOnMobile(videoElement, newProps)
                    } else {
                        b64 = await generateGif(newProps)
                    }
                } catch (err) {
                    console.log(err.message)
                }

                dispatch(pendingPreview(false))
                dispatch(newPreview({ b64, properties: formValues }))
                openSnackbar({ message: 'Preview ready', variant: 'info' })
            }, COUNTER_INTERVAL * 3)

            setTimeout(() => {
                setPreviewState({ counting: false, recording: false })
            }, COUNTER_INTERVAL * 6)
        }
    }, [formValues])

    const renderPreviewHeader = () => {
        if (!b64) {
            return (
                <div className={classes.topBar} style={{ minWidth: 300, maxWidth: previewSize.width }}>
                    <FormControlLabel
                        control={<Switch checked={showText} onChange={e => setShowText(e.target.checked)}></Switch>}
                        label={<Typography color="textSecondary">Show text placement</Typography>}
                    ></FormControlLabel>
                    <Tooltip title={<Typography variant="subtitle2">Note</Typography>}>
                        <InfoIcon
                            color="disabled"
                            onClick={() => setOpenDialog(true)}
                            style={{ marginLeft: 'auto', cursor: 'pointer' }}
                        ></InfoIcon>
                    </Tooltip>
                    <PreviewGuideDialog
                        open={openDialog}
                        setOpen={setOpenDialog}
                        onClose={() => setOpenDialog(false)}
                    ></PreviewGuideDialog>
                </div>
            )
        }
    }

    const renderTextPreview = () => {
        if (!b64 && !camLoading && showText && Object.keys(formErrors).length === 0) {
            return <TextPreview previewSize={previewSize} />
        }
    }

    const renderCounter = () => {
        if (previewState.counting) {
            return (
                <div className={classes.counterOverlay} style={{ width: previewSize.width, height: previewSize.height }}>
                    {counter}
                </div>
            )
        }
    }

    const renderLoader = () => {
        if ((pending && !previewState.recording && !previewState.counting) || camLoading) {
            return <Loading width={previewSize.width} height={previewSize.height} />
        }
    }
    const renderPreviewButton = () => {
        if (!camLoading && !b64)
            return (
                <Button
                    className={classes.generateBtn}
                    onClick={formSubmit}
                    variant="outlined"
                    color="default"
                    disabled={pending || !Object.keys(formErrors).length === 0}
                    style={{ width: previewSize.width }}
                >
                    {previewState.recording ? (
                        <Typography className={classes.startGiffing} color="secondary">
                            START GIFFING!
                        </Typography>
                    ) : (
                        'PREVIEW GIF'
                    )}
                </Button>
            )
    }

    const renderWebcam = () => {
        return (
            <Webcam
                style={{ borderTopLeftRadius: '4px', borderTopRightRadius: '4px', position: 'absolute' }}
                ref={webcamRef}
                videoConstraints={{ width: formValues.gifWidth, height: formValues.gifHeight }}
                onUserMedia={() => {
                    if (webcamRef && webcamRef.current && webcamRef.current.video) {
                        webcamRef.current.video.onplaying = () => {
                            let newDimensions = {
                                width: webcamRef.current.video.videoWidth,
                                height: webcamRef.current.video.videoHeight,
                            }
                            setCamLoading(false)
                            setPreviewSize(newDimensions)
                        }
                    }
                }}
            ></Webcam>
        )
    }

    const renderPreview = () => {
        if (b64 && !pending) {
            return <PreviewCard gifProperties={properties} gifB64={b64} />
        }
    }

    return (
        <Grid container style={{ width: '100vw', flexWrap: 'wrap' }}>
            <div style={{ marginRight: 20 }}>
                <div style={{ marginLeft: '16px' }}>
                    {b64 ? (
                        <Typography style={{ marginBottom: '15px' }} color="textSecondary" variant="h6">
                            Preview
                        </Typography>
                    ) : (
                        ''
                    )}

                    {renderPreviewHeader()}
                    <div style={{ width: 'fit-content', minWidth: '300px', minHeight: '300px' }}>
                        {renderTextPreview()}
                        {renderCounter()}
                        {renderLoader()}
                        <div
                            className={classes.videoContainer}
                            style={{ minWidth: previewSize.width, minHeight: `${previewSize.height}px` }}
                        >
                            {renderWebcam()}
                            {renderPreview()}
                        </div>
                        {renderPreviewButton()}
                    </div>
                </div>
            </div>
            <Grid item style={{ marginTop: '40px' }}>
                <CreateForm tabIndex={0} />
            </Grid>
        </Grid>
    )
}
