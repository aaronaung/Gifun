import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import FileCopyIcon from '@material-ui/icons/FileCopy'

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        border: `${theme.palette.grey[700]} solid 2px`,
        borderStyle: 'dashed',
        background: theme.palette.grey[900],
        borderRadius: 5,
        margin: '0 20%',
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileIcon: {
        marginRight: 10,
    },
}))

export default function MyDropzone() {
    const classes = useStyles()
    const onDrop = useCallback(acceptedFiles => {
        // Do something with the files
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <div className={classes.root} {...getRootProps()}>
            <input {...getInputProps()} />
            <FileCopyIcon className={classes.fileIcon}></FileCopyIcon>
            {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
        </div>
    )
}
