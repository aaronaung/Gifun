import { Theme, Badge } from '@material-ui/core'
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
    },
}))

export default function UploadFile({ onChange }) {
    const classes = useStyles()
    const onDrop = useCallback(acceptedFiles => {
        onChange(acceptedFiles)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <div className={classes.root} {...getRootProps()}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <input {...getInputProps({ accept: 'image/*' })} />
                <FileCopyIcon className={classes.fileIcon}></FileCopyIcon>
                {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
            </div>
        </div>
    )
}
