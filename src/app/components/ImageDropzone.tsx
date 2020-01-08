import { Theme, Badge } from '@material-ui/core'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import DeleteIcon from '@material-ui/icons/Cancel'
import { makeStyles } from '@material-ui/styles'
import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { v4 as uuid } from 'uuid'
import Dropzone from './Dropzone'

const useStyles = makeStyles((theme: Theme) => ({
    imagePreview: {
        width: 80,
        height: 80,
        objectFit: 'cover',
        borderRadius: 3,
        margin: 5,
        cursor: 'default',
        [theme.breakpoints.down('sm')]: {
            width: 50,
            height: 50,
        },
    },
    imagePreviewsContainer: {
        width: '100%',
    },
}))

export default function ImageDropZone({ onChange }) {
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

    return (
        <Dropzone onDrop={onDrop} accept="images/*">
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
                                    style={{ width: 50 }}
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
        </Dropzone>
    )
}
