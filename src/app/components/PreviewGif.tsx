import React, { useCallback, useState, useRef, useEffect } from 'react'
import {
    Typography,
    CircularProgress,
    Badge,
    Tooltip,
    FormControlLabel,
    Switch,
    Popover,
    Dialog,
    DialogTitle,
    List,
    ListItem,
    DialogContentText,
    DialogContent,
    Divider,
} from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { previewSelector } from '../redux/preview/preview.selector'
import { makeStyles } from '@material-ui/styles'
import { StaticQuery, graphql } from 'gatsby'
import defaultGif from '../../images/look-left.gif'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import CloudDownloadIcon from '@material-ui/icons/CloudDownloadTwoTone'
import FavoriteTwoTone from '@material-ui/icons/FavoriteTwoTone'
import CancelIcon from '@material-ui/icons/CancelTwoTone'
import InfoIcon from '@material-ui/icons/Info'
import { getUser } from '../services/auth'
import { uploadGifForUser, generateGif } from '../services/gif.service'
import { addGifs } from '../redux/gifs/gifs.action'
import Webcam from 'react-webcam'
import { formSelector } from '../redux/form/form.selector'
import { removePreview, pendingPreview, newPreview } from '../redux/preview/preview.action'
import { useCameraContext } from '../contexts/CameraContext'

const useStyles = makeStyles((theme: Theme) => ({
    title: {
        marginBottom: theme.spacing(3),
    },
    topBar: {
        marginBottom: '5px',
        display: 'flex',
        alignItems: 'center',
    },
    actionBtns: {
        minWidth: '30px',
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
    },
    textPlacementOverlay: {
        position: 'absolute',
    },
    generateBtn: {
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        height: '49px',
    },
    loadingOverlay: {
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
        fontSize: '25px',
    },
    startGiffing: {
        color: theme,
    },
}))

const COUNTER_INTERVAL = 800
const PREVIEW_GUIDE = [
    `Preview text placement by toggling the "Show text placement" switch.`,
    `Customize text placement by changing "Text Placement" to "Custom". `,
]

function MediaCard({ gifProperties, gifB64 }) {
    const classes = useStyles()
    const { gifHeight, gifWidth } = gifProperties
    const [saving, setSaving] = useState(false)
    const [cameraState, setCameraState] = useCameraContext()
    const { identityAddress: userId } = getUser()
    const dispatch = useDispatch()

    const handleSavePreview = useCallback(async () => {
        setSaving(true)
        let resp = await uploadGifForUser(gifProperties, gifB64, userId)
        dispatch(addGifs(resp))
        setSaving(false)
    }, [])

    const handleRemovePreview = useCallback(() => {
        setCameraState({ on: false, loading: true })
        dispatch(removePreview())
    })

    return (
        <Card style={{ minWidth: '200px', width: `${gifWidth}px` }}>
            <CardActionArea>
                <CardMedia image={gifB64} title="Gifuru Preview" style={{ height: `${gifHeight}px`, width: `${gifWidth}px` }} />
            </CardActionArea>

            <CardActions style={{ justifyContent: 'space-around' }}>
                <Tooltip title={<Typography variant="subtitle2">Download</Typography>}>
                    <a download="gifuru.gif" href={gifB64} style={{ textDecoration: 'none' }}>
                        <Button size="medium" style={{ color: '#66bb6a' }} className={classes.actionBtns}>
                            <CloudDownloadIcon fontSize="default" />
                        </Button>
                    </a>
                </Tooltip>

                <Tooltip title={<Typography variant="subtitle2">Save</Typography>}>
                    <Button
                        disabled={saving}
                        size="medium"
                        style={{ color: '#ec407a' }}
                        onClick={handleSavePreview}
                        className={classes.actionBtns}
                    >
                        <FavoriteTwoTone fontSize="default" />
                    </Button>
                </Tooltip>

                <Tooltip title={<Typography variant="subtitle2">Cancel</Typography>}>
                    <Button
                        size="medium"
                        style={{ color: '#d32f2f' }}
                        className={classes.actionBtns}
                        onClick={handleRemovePreview}
                    >
                        <CancelIcon fontSize="default" />
                    </Button>
                </Tooltip>
            </CardActions>
        </Card>
    )
}

const Loading = ({ width, height }) => {
    width = width || 300
    height = height || 300
    const classes = useStyles()
    return (
        <div className={classes.loadingOverlay} style={{ width, height }}>
            <CircularProgress></CircularProgress>
        </div>
    )
}

function PreviewGuideDialog(props) {
    const classes = useStyles()
    const { open, setOpen } = props

    return (
        <Dialog aria-labelledby="dialog" open={open} onBackdropClick={() => setOpen(false)}>
            <DialogTitle id="dialog">Note</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    The camera dimensions are auto-adjusted to keep the aspect ratio and achieve the best quality GIF: the width
                    and height inputs may not exactly define the preview dimensions.
                </DialogContentText>
                {/* <Divider></Divider> */}
                <DialogContentText id="alert-dialog-description">
                    Don't be afraid to play around with <b>Text placements</b> and <b>Font settings</b>!
                </DialogContentText>
            </DialogContent>
        </Dialog>
    )
}

const PreviewGif = () => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const webcamRef = useRef(null)

    /** State variables */
    const [previewSize, setPreviewSize] = useState({ width: 300, height: 300 })
    const [cameraState, setCameraState] = useCameraContext()
    const [counter, setCounter] = useState(3)
    const [showText, setShowText] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [previewState, setPreviewState] = useState({ counting: false, processing: false, recording: false })

    /** Redux store values */
    const { pending, b64, properties } = useSelector(state => previewSelector(state))
    const { formValues, formErrors } = useSelector(state => formSelector(state))

    useEffect(() => {
        if (webcamRef.current) {
            let newDimensions = { width: webcamRef.current.video.videoWidth, height: webcamRef.current.video.videoHeight }
            setPreviewSize(newDimensions)
        }
    }, [formValues.gifWidth, formValues.gifHeight])

    const textPreviewStyling = useCallback(() => {
        let baseFontStyle = {
            fontFamily: formValues.fontFamily,
            fontWeight: formValues.fontWeight,
            fontSize: `${formValues.fontSize}px`,
        }
        switch (formValues.textBaseline) {
            case 'custom':
                return {
                    ...baseFontStyle,
                    position: 'relative',
                    top: `${formValues.textYCoordinate}px`,
                    left: `${formValues.textXCoordinate}px`,
                    transform: `translate(-50%,-75%)`,
                    width: 'fit-content',
                }
            case 'bottom':
                return {
                    ...baseFontStyle,
                    position: 'relative',
                    textAlign: 'center',
                    top: '100%',
                    transform: 'translateY(-100%)',
                }
            case 'top':
                return {
                    ...baseFontStyle,
                    position: 'relative',
                    textAlign: 'center',
                    top: '0px',
                }
        }
    }, [formValues])

    const formSubmit = useCallback(async () => {
        if (Object.keys(formErrors).length === 0) {
            setPreviewState({ counting: true, recording: false, processing: false })
            dispatch(pendingPreview(true))

            let interval = setInterval(() => setCounter(counter => counter - 1), COUNTER_INTERVAL)
            setTimeout(async () => {
                clearInterval(interval)
                setCounter(3)
                setPreviewState({ counting: false, recording: true, processing: false })
                let newDimensions = {
                    gifHeight: webcamRef.current.video.videoHeight,
                    gifWidth: webcamRef.current.video.videoWidth,
                }

                let b64 = await generateGif({ ...formValues, ...newDimensions })
                setPreviewState({ counting: false, recording: false, processing: false })
                dispatch(newPreview({ b64, properties: formValues }))
            }, COUNTER_INTERVAL * 3)

            setTimeout(() => {
                /** after the gif capture time is over and gif is still processing */
                if (previewState.processing === false && !b64) {
                    setPreviewState({ counting: false, recording: false, processing: true })
                }
                dispatch(pendingPreview(false))
            }, COUNTER_INTERVAL * 6)
        }
    }, [formValues])

    return (
        <div>
            <Typography style={{ marginBottom: '15px' }} color="textSecondary" variant="h5">
                Preview
            </Typography>
            {!cameraState.loading && !b64 ? (
                <div className={classes.topBar} style={{ width: previewSize.width }}>
                    <FormControlLabel
                        control={<Switch checked={showText} onChange={e => setShowText(e.target.checked)}></Switch>}
                        label={<Typography color="textSecondary">Show text placement</Typography>}
                    ></FormControlLabel>
                    <InfoIcon
                        color="disabled"
                        onClick={() => setOpenDialog(true)}
                        style={{ marginLeft: 'auto', cursor: 'pointer' }}
                    ></InfoIcon>
                    <PreviewGuideDialog
                        open={openDialog}
                        setOpen={setOpenDialog}
                        onClose={() => setOpenDialog(false)}
                    ></PreviewGuideDialog>
                </div>
            ) : (
                ''
            )}

            {cameraState.loading ? <Loading width={previewSize.width} height={previewSize.height} /> : ''}
            <div style={{ display: 'flex' }}>
                {!previewState.processing && !b64 && cameraState.on && showText && Object.keys(formErrors).length === 0 ? (
                    <div
                        className={classes.textPlacementOverlay}
                        style={{ width: previewSize.width, height: previewSize.height }}
                    >
                        <div className="text" style={textPreviewStyling()}>
                            {formValues.text}
                        </div>
                    </div>
                ) : (
                    ''
                )}
                {previewState.counting ? (
                    <div className={classes.counterOverlay} style={{ width: previewSize.width, height: previewSize.height }}>
                        {counter}
                    </div>
                ) : (
                    ''
                )}
                {previewState.processing ? <Loading width={previewSize.width} height={previewSize.height} /> : ''}
                {b64 && !pending ? (
                    <MediaCard gifProperties={properties} gifB64={b64} />
                ) : (
                    <div className={classes.videoContainer}>
                        <Webcam
                            style={{ borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}
                            ref={webcamRef}
                            videoConstraints={{ width: formValues.gifWidth, height: formValues.gifHeight }}
                            onUserMedia={() => {
                                setCameraState({ on: false, loading: true })
                                webcamRef.current.video.onplaying = () => {
                                    setCameraState({ on: true, loading: false })
                                    let newDimensions = {
                                        width: webcamRef.current.video.videoWidth,
                                        height: webcamRef.current.video.videoHeight,
                                    }
                                    setPreviewSize(newDimensions)
                                }
                            }}
                        ></Webcam>
                        {cameraState.on && !previewState.processing ? (
                            <Button
                                className={classes.generateBtn}
                                onClick={formSubmit}
                                variant="outlined"
                                color="default"
                                disabled={pending || !Object.keys(formErrors).length === 0}
                            >
                                {previewState.recording ? (
                                    <Typography className={classes.startGiffing} color="secondary">
                                        START GIFFING!
                                    </Typography>
                                ) : (
                                    'PREVIEW GIF'
                                )}
                            </Button>
                        ) : (
                            ''
                        )}
                    </div>
                )}

                {/* {camSize && webcamRef.current ? `${webcamRef.current.video.videoWidth}` : 'CAM NOT READY'} */}

                {/* <PreviewGif /> */}
            </div>
        </div>
    )
}

export default PreviewGif
