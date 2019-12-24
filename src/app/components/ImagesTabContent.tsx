import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme, Typography, Grid } from '@material-ui/core'
import { formSelector } from '../redux/form/form.selector'
import { useSelector, useDispatch } from 'react-redux'
import { generateGif } from '../services/gif.service'
import { newPreview, removePreview } from '../redux/preview/preview.action'
import PreviewCard from './PreviewCard'
import { previewSelector } from '../redux/preview/preview.selector'
import { isMobile } from 'react-device-detect'
import { getExif } from '../services/utils'
import { updateFormValues, resetForm } from '../redux/form/form.action'
import MyDropzone from './Dropzone'
import CreateForm from './CreateForm'

const useStyles = makeStyles((theme: Theme) => ({
    imageContainer: {
        marginLeft: 15,
        marginRight: 30,
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.down('sm')]: {
            margin: '20px 15px',
        },
        marginBottom: 20,
    },
}))

export default function ImagesTabContent() {
    const [showPreview, setShowPreview] = useState(false)
    const [images, setImages] = useState([])
    const dispatch = useDispatch()
    const classes = useStyles()

    const { formValues, formErrors } = useSelector(state => formSelector(state))
    const { b64 } = useSelector(state => previewSelector(state))

    const handleFilesChange = images => {
        let imgs = Object.keys(images).map(id => {
            const img = document.createElement('img')
            img.src = images[id]
            return img
        })
        setImages(imgs)
    }

    const generatePreview = async () => {
        let drawImage = img => {
            return new Promise(async (resolve, reject) => {
                let exifData = await getExif(img.src.split(',')[1])
                setTimeout(() => {
                    let canvas = document.createElement('canvas')
                    let ctx = canvas.getContext('2d')

                    canvas.width = formValues.gifWidth
                    canvas.height = formValues.gifHeight
                    var scale = Math.max(canvas.width / img.width, canvas.height / img.height)
                    // get the top left position of the image
                    var x = canvas.width / 2 - (img.width / 2) * scale
                    var y = canvas.height / 2 - (img.height / 2) * scale
                    if (isMobile && exifData.Orientation === 6) {
                        ctx.rotate((90 * Math.PI) / 180)
                        ctx.translate(0, -canvas.width)
                    }
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

                    let b64 = canvas.toDataURL()
                    let resultImage = new Image()
                    resultImage.src = b64

                    resolve(resultImage)
                }, 200)
            })
        }

        let editedImages = await Promise.all(images.map(async img => await drawImage(img)))

        const newProps = {
            ...formValues,
            images: editedImages,
        }
        let b64 = await generateGif(newProps)
        dispatch(newPreview({ b64, properties: formValues }))
    }

    useEffect(() => {
        if (Object.keys(images).length > 1) {
            setShowPreview(true)
            generatePreview()
        } else {
            setShowPreview(false)
            dispatch(removePreview())
        }
    }, [formValues, images])

    return (
        <div>
            <MyDropzone onChange={handleFilesChange}></MyDropzone>
            <Grid container style={{ width: '100vw', flexWrap: 'wrap' }}>
                <div className={classes.imageContainer}>
                    <PreviewCard
                        gifProperties={formValues}
                        gifB64={b64}
                        hideCancelBtn={true}
                        defaultContent={<Typography>You must upload at least two pictures to see the preview</Typography>}
                    ></PreviewCard>
                </div>
                <Grid item>
                    <CreateForm tabIndex={1} />
                </Grid>
            </Grid>
        </div>
    )
}
