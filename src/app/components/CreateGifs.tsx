import { Box, Grid, Theme, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useDispatch, useSelector } from 'react-redux'
import sorry from '../../images/sorry.gif'
import { useTabContext } from '../contexts/TabContext'
import { formSelector } from '../redux/form/form.selector'
import { newPreview, removePreview } from '../redux/preview/preview.action'
import { previewSelector } from '../redux/preview/preview.selector'
import { generateGif } from '../services/gif.service'
import '../vendors/flickity.css'
import CreateForm from './CreateForm'
import MyDropzone from './Dropzone'
import PreviewCard from './PreviewCard'
import PreviewGif from './WebCamPreview'

interface TabPanelProps {
    children?: React.ReactNode
    index: any
    value: any
}

const useStyles = makeStyles((theme: Theme) => ({
    tabs: {
        paddingLeft: theme.spacing(2),
        justifyContent: 'center',
    },
    sorryGif: {
        width: '100%',
        marginTop: 20,
        borderRadius: 5,
    },
    imageContainer: {
        marginLeft: 15,
        marginRight: 30,
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.down('sm')]: {
            margin: '20px 15px',
        },
    },
    warningText: {
        marginLeft: 15,
        marginRight: 30,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        textAlign: 'center',
        color: theme.palette.secondary.main,
    },
}))

function a11yProps(index: any) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    }
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            <Box paddingTop={2}>{children}</Box>
        </Typography>
    )
}

const CreateGifs = props => {
    const classes = useStyles()
    const dispatch = useDispatch()
    /** State variables */
    const { tabState, setTabState } = useTabContext()
    const [images, setImages] = useState([])
    const { formValues, formErrors } = useSelector(state => formSelector(state))
    const [showPreview, setShowPreview] = useState(false)
    const { pending, b64, properties } = useSelector(state => previewSelector(state))

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue)
    }

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
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    let canvas = document.createElement('canvas')
                    let ctx = canvas.getContext('2d')
                    canvas.width = formValues.gifWidth
                    canvas.height = formValues.gifHeight
                    var scale = Math.max(canvas.width / img.width, canvas.height / img.height)
                    // get the top left position of the image
                    var x = canvas.width / 2 - (img.width / 2) * scale
                    var y = canvas.height / 2 - (img.height / 2) * scale
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
        <Grid container spacing={3} className={classes.main}>
            <Grid item xs={12} lg={12}>
                <TabPanel value={tabState} index={0}>
                    {isMobile ? (
                        <>
                            <Typography>
                                Because of technical limitations, the browser version of <b>GIFun</b> webcam feature is not
                                supported on mobile devices at the moment.
                            </Typography>
                            <img src={sorry} className={clsx(classes.sorryGif)}></img>
                        </>
                    ) : (
                        <Grid container style={{ width: '100vw', flexWrap: 'wrap' }}>
                            <div style={{ marginRight: 20 }}>
                                <PreviewGif />
                            </div>
                            {tabState === 0 ? (
                                <Grid item style={{ marginTop: '40px' }}>
                                    <CreateForm tabIndex={0} />
                                </Grid>
                            ) : (
                                ''
                            )}
                        </Grid>
                    )}
                </TabPanel>
                <TabPanel value={tabState} index={1}>
                    <MyDropzone onChange={handleFilesChange}></MyDropzone>
                    {tabState === 1 ? (
                        <Grid container style={{ width: '100vw', flexWrap: 'wrap' }}>
                            <div className={classes.imageContainer}>
                                <PreviewCard
                                    gifProperties={formValues}
                                    gifB64={b64}
                                    hideCancelBtn={true}
                                    defaultContent={
                                        <Typography>You must upload at least two pictures to see the preview</Typography>
                                    }
                                ></PreviewCard>
                            </div>

                            <Grid item>
                                <CreateForm tabIndex={1} />
                            </Grid>
                        </Grid>
                    ) : (
                        ''
                    )}
                </TabPanel>
                <TabPanel value={tabState} index={2}>
                    <Typography color="textSecondary" className={classes.tabs}>
                        Coming soon...
                    </Typography>
                </TabPanel>
            </Grid>
        </Grid>
    )
}

export default CreateGifs
