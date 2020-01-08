import { Theme, Badge, Typography } from '@material-ui/core'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import DeleteIcon from '@material-ui/icons/Cancel'
import { makeStyles } from '@material-ui/styles'
import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { v4 as uuid } from 'uuid'

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        border: `${theme.palette.grey[700]} solid 2px`,
        borderStyle: 'dashed',
        background: theme.palette.grey[900],
        borderRadius: 5,
        marginBottom: 30,
        margin: '0 15px',
        padding: 40,
        textAlign: 'center',
        cursor: 'pointer',
        '&:focus': {
            outline: 'none',
        },
        '&:hover': {
            borderColor: theme.palette.grey[600],
            background: theme.palette.grey[800],
        },
        [theme.breakpoints.down('sm')]: {
            margin: '0 5%',
        },
        transition: 'background ease 0.5s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
    },
    fileIcon: {
        marginRight: 10,
        marginBottom: 20,
    },
}))

export default function Dropzone({ onDrop, accept, children, message }) {
    const classes = useStyles()
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <div className={classes.root} {...getRootProps()}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <input {...getInputProps({ accept })} />
                <FileCopyIcon className={classes.fileIcon}></FileCopyIcon>
                {message ? (
                    <Typography>{message}</Typography>
                ) : (
                    <Typography style={{ marginBottom: 20 }}>Drag n drop or click to upload</Typography>
                )}
            </div>
            {children}
        </div>
    )
}
