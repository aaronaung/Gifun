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
        height: 250,
    },
    fileIcon: {
        marginRight: 10,
    },
    imagePreview: {
        width: 80,
        height: 80,
        objectFit: 'cover',
        borderRadius: 3,
        margin: 5,
        cursor: 'default',
    },
    imagePreviewsContainer: {
        width: '100%',
    },
}))

export default function MyDropzone({ onChange }) {
    const classes = useStyles()
    const [imagePreviews, setImagePreviews] = useState({})
    const onDrop = useCallback(acceptedFiles => {
        acceptedFiles.forEach((file, index) => {
            const reader = new FileReader()
            const id = uuid()
            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                const b64 = reader.result
                setImagePreviews(prev => {
                    onChange({ ...prev, ...{ [id]: b64 } })
                    return { ...prev, ...{ [id]: b64 } }
                })
            }
            reader.readAsDataURL(file)
        })
    }, [])

    const removeImagePreview = id => {
        setImagePreviews(imagePreviews => {
            let newImagePreviews = { ...imagePreviews }
            delete newImagePreviews[id]
            onChange(newImagePreviews)
            return newImagePreviews
        })
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <div className={classes.root} {...getRootProps()}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <input {...getInputProps({ accept: 'image/*' })} />
                <FileCopyIcon className={classes.fileIcon}></FileCopyIcon>
                {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
            </div>

            <div className={classes.imagePreviewsContainer}>
                {Object.keys(imagePreviews).map(id => {
                    return (
                        <Badge
                            key={`${id}-badge`}
                            style={{ zIndex: 10 }}
                            badgeContent={
                                <DeleteIcon
                                    onClick={e => {
                                        e.stopPropagation()
                                        removeImagePreview(id)
                                    }}
                                    color="secondary"
                                    fontSize="default"
                                ></DeleteIcon>
                            }
                        >
                            <img
                                style={{ zIndex: 10 }}
                                onClick={e => e.stopPropagation()}
                                src={imagePreviews[id]}
                                key={id}
                                className={classes.imagePreview}
                            ></img>
                        </Badge>
                    )
                })}
            </div>
        </div>
    )
}
