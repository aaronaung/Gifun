import React from 'react'
import { CircularProgress, Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles((theme: Theme) => ({
    loadingOverlay: {
        border: 'grey solid 1px',
        borderStyle: 'dashed',
        background: '#272727',
        display: 'flex',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        zIndex: 10,
    },
}))

export default function Loading({ width, height }) {
    width = width || 300
    height = height || 300
    const classes = useStyles()
    return (
        <div className={classes.loadingOverlay} style={{ width, height }}>
            <CircularProgress></CircularProgress>
        </div>
    )
}
