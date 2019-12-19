import { CircularProgress, Tooltip, Typography } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardMedia from '@material-ui/core/CardMedia'
import CancelIcon from '@material-ui/icons/CancelTwoTone'
import CloudDownloadIcon from '@material-ui/icons/CloudDownloadTwoTone'
import FavoriteIcon from '@material-ui/icons/FavoriteOutlined'
import FavoriteTwoTone from '@material-ui/icons/FavoriteTwoTone'
import ShareIcon from '@material-ui/icons/Share'
import clsx from 'clsx'
import { navigate } from 'gatsby'
import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useCameraContext } from '../contexts/CameraContext'
import { useSnackbarContext } from '../contexts/SnackbarContext'
import { removePreview, setSaved } from '../redux/preview/preview.action'
import { previewSelector } from '../redux/preview/preview.selector'
import { getUser } from '../services/auth'
import { uploadGifForUser } from '../services/gif.service'
import { CopyBoard } from './GifLightBox'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles((theme: Theme) => ({
    title: {
        marginBottom: theme.spacing(3),
    },
    actionBtn: {
        minWidth: '35px',
        cursor: 'pointer',
        '& .MuiSvgIcon-root': {
            fontSize: 30,
            color: theme.colors.default,
        },
    },
    textPlacementOverlay: {
        position: 'absolute',
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

export default function PreviewCard({ gifProperties, gifB64 }) {
    const { gifHeight, gifWidth } = gifProperties
    const classes = useStyles()

    const [saving, setSaving] = useState(false)
    const [openShareModal, setOpenShareModal] = useState(false)
    const [cameraState, setCameraState] = useCameraContext()

    const { identityAddress: userId } = getUser()
    const { openSnackbar } = useSnackbarContext()
    const dispatch = useDispatch()
    const { saved, shareableLink } = useSelector(state => previewSelector(state))

    const handleSavePreview = useCallback(async () => {
        setSaving(true)
        let resp = await uploadGifForUser(gifProperties, gifB64, userId)
        dispatch(setSaved(true, resp.shareableLink))
        openSnackbar({
            message: 'Save successful',
            action: [
                <Tooltip
                    key="checkitout"
                    style={{ cursor: 'pointer', color: 'white' }}
                    title={<Typography variant="subtitle1">See it in your favorite list</Typography>}
                >
                    <FavoriteIcon key="undo" color="secondary" size="small" onClick={() => navigate('/app')}></FavoriteIcon>
                </Tooltip>,
            ],
        })
        setSaving(false)
    }, [])

    const handleRemovePreview = useCallback(() => {
        setCameraState({ on: false, loading: true })
        dispatch(removePreview())
    })

    return (
        <>
            <CopyBoard open={openShareModal} setOpen={setOpenShareModal} shareableLink={shareableLink}></CopyBoard>
            <Card style={{ minWidth: '200px', width: `${gifWidth}px` }}>
                <CardActionArea>
                    {saving ? <CircularProgress className={clsx(classes.savingLoader)}></CircularProgress> : ''}
                    <CardMedia
                        className={clsx(saving ? classes.savingOverlay : '')}
                        image={gifB64}
                        title="Gifun Preview"
                        style={{ height: `${gifHeight}px`, width: `${gifWidth}px` }}
                    />
                </CardActionArea>

                <CardActions style={{ justifyContent: 'space-around' }}>
                    <Tooltip title={<Typography variant="subtitle2">{!saving ? `Download` : `Saving ...`}</Typography>}>
                        <a download="gifun-preview.gif" href={gifB64} style={{ textDecoration: 'none' }}>
                            <Button
                                onClick={() => openSnackbar({ message: 'Download successful', variant: 'success' })}
                                disabled={saving}
                                size="medium"
                                className={clsx(classes.actionBtn, classes.downloadBtn)}
                            >
                                <CloudDownloadIcon color={saving ? 'disabled' : 'inherit'} />
                            </Button>
                        </a>
                    </Tooltip>

                    {!saved ? (
                        <Tooltip title={<Typography variant="subtitle2">{!saving ? `Save` : `Processing ...`}</Typography>}>
                            <span>
                                <Button
                                    disabled={saving}
                                    size="medium"
                                    onClick={handleSavePreview}
                                    className={clsx(classes.actionBtn, classes.favoriteBtn)}
                                >
                                    <FavoriteTwoTone color={saving ? 'disabled' : 'inherit'} />
                                </Button>
                            </span>
                        </Tooltip>
                    ) : (
                        ''
                    )}

                    {saved ? (
                        <Tooltip title={<Typography variant="subtitle2">{!saving ? `Share` : `Processing ...`}</Typography>}>
                            <span>
                                <Button
                                    disabled={saving}
                                    size="medium"
                                    onClick={() => {
                                        setOpenShareModal(true)
                                    }}
                                    className={clsx(classes.actionBtn, classes.shareBtn)}
                                >
                                    <ShareIcon color={saving ? 'disabled' : 'inherit'}></ShareIcon>
                                </Button>
                            </span>
                        </Tooltip>
                    ) : (
                        ''
                    )}

                    <Tooltip title={<Typography variant="subtitle2">{!saving ? `Cancel` : `Processing ...`}</Typography>}>
                        <span>
                            <Button
                                disabled={saving}
                                size="medium"
                                style={{ color: '#d32f2f' }}
                                className={clsx(classes.actionBtn, classes.cancelBtn)}
                                onClick={handleRemovePreview}
                            >
                                <CancelIcon color={saving ? 'disabled' : 'inherit'} fontSize="default" />
                            </Button>
                        </span>
                    </Tooltip>
                </CardActions>
            </Card>
        </>
    )
}
