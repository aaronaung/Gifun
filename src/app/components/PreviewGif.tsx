import React from 'react'
import { Typography, CircularProgress } from '@material-ui/core'
import { useSelector } from 'react-redux'
import { previewSelector } from '../redux/preview/preview.selector'
import { makeStyles } from '@material-ui/styles'
import { StaticQuery, graphql } from 'gatsby'
import defaultGif from '../../images/look-left.gif'

const useStyles = makeStyles((theme: Theme) => ({
    title: {
        marginBottom: theme.spacing(3),
    },
}))

const PreviewGif = () => {
    const { b64, pending } = useSelector(state => previewSelector(state))
    const classes = useStyles()
    const title = b64 ? (pending ? 'Generating GIF...' : 'Preview') : pending ? 'Generating GIF...' : 'No Preview'
    return (
        <div>
            <Typography className={classes.title}>{title}</Typography>
            {b64 || pending ? '' : <img src={defaultGif}></img>}
            {pending ? <CircularProgress /> : <img src={b64}></img>}
        </div>
    )
}

export default PreviewGif
