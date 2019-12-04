import React, { useCallback, useState } from 'react'
import { Typography, CircularProgress, Badge, Tooltip } from '@material-ui/core'
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
import { getUser } from '../services/auth'
import { uploadGifForUser } from '../services/gif.service'
import { addGifs } from '../redux/gifs/gifs.action'
import Webcam from 'react-webcam'
import { formSelector } from '../redux/form/form.selector'
import { removePreview } from '../redux/preview/preview.action'

const useStyles = makeStyles((theme: Theme) => ({
    title: {
        marginBottom: theme.spacing(3),
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
}))

function MediaCard({ gifProperties, gifB64 }) {
    const classes = useStyles()
    const { gifHeight, gifWidth } = gifProperties
    const [saving, setSaving] = useState(false)
    const { identityAddress: userId } = getUser()
    const dispatch = useDispatch()

    const handleSavePreview = useCallback(async () => {
        setSaving(true)
        let resp = await uploadGifForUser(gifProperties, gifB64, userId)
        dispatch(addGifs(resp))
        setSaving(false)
    }, [])

    const handleRemovePreview = useCallback(() => {
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

const PreviewGif = () => {
    const { b64, properties } = useSelector(state => previewSelector(state))
    return <MediaCard gifProperties={properties} gifB64={b64} />
}

export default PreviewGif
