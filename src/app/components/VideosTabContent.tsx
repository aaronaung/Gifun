import React, { useCallback, useState, useRef } from 'react'
import Dropzone from './Dropzone'
import { Typography, makeStyles, Theme, Button, Grid } from '@material-ui/core'
import CreateForm from './CreateForm'
import { formSelector } from '../redux/form/form.selector'
import { useSelector } from 'react-redux'
import { previewSelector } from '../redux/preview/preview.selector'
import { generateGif } from '../services/gif.service'
import clsx from 'clsx'

const useStyles = makeStyles((theme: Theme) => ({
    videoContainer: {
        [theme.breakpoints.down('sm')]: {
            margin: '0 5%',
        },
        margin: '0 15px',
        display: 'flex',
        flexDirection: 'column',
        height: 200,
        width: 'fit-content',
    },
    generateBtn: {
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        height: '50px',
        width: '100%',
    },
    video: {
        borderRadius: 5,
        '&:focus': {
            outline: 'none',
        },
    },
}))

export default function VideosTabContent() {
    const [error, setError] = useState(null)
    const [videoSrc, setVideoSrc] = useState(null)
    const videoRef = useRef(null)
    const classes = useStyles()
    const { formValues, formErrors } = useSelector(state => formSelector(state))
    const { b64, pending } = useSelector(state => previewSelector(state))

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 1) {
            setError('You may upload only 1 video file per preview.')
            return
        } else {
            setError(null)
        }

        let videoSrc = URL.createObjectURL(acceptedFiles[0])
        setVideoSrc(videoSrc)
    }, [])

    const formSubmit = useCallback(async () => {
        console.log(document.querySelectorAll('video'))
        let props = { ...formValues, video: document.querySelector('.mainVideo') }
        let b64 = await generateGif(props)
        console.log(b64)
    }, [])

    const renderErrorMessage = () => {
        if (error) {
            return (
                <Typography variant={'subtitle1'} color="secondary">
                    {error}
                </Typography>
            )
        }
    }

    const renderVideo = () => {
        if (videoSrc) {
            return (
                <video
                    ref={videoRef}
                    className={clsx([classes.video, 'mainVideo'])}
                    style={{ width: 'auto', height: 200 }}
                    controls
                    src={videoSrc}
                ></video>
            )
        } else {
            return (
                <div
                    style={{
                        width: 300,
                        height: 200,
                        border: '1px solid grey',
                        borderStyle: 'dashed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    No video preview
                </div>
            )
        }
    }

    const renderPreviewButton = () => {
        if (videoSrc) {
            return (
                <Button
                    className={classes.generateBtn}
                    onClick={formSubmit}
                    variant="outlined"
                    color="default"
                    disabled={pending || !Object.keys(formErrors).length === 0}
                >
                    <Typography className={classes.startGiffing} color="secondary">
                        Preview Gif
                    </Typography>
                </Button>
            )
        }
    }
    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                    <Dropzone accept="video/*" onDrop={onDrop}>
                        {renderErrorMessage()}
                    </Dropzone>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <div className={classes.videoContainer}>
                        {renderVideo()}
                        {renderPreviewButton()}
                    </div>
                </Grid>
            </Grid>

            <div style={{ display: 'flex' }}>{videoSrc ? <CreateForm></CreateForm> : ''}</div>
        </div>
    )
}
