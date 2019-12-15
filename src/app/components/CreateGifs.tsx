import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
    Grid,
    Tab,
    Typography,
    Box,
    Tabs,
    Theme,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    Switch,
} from '@material-ui/core'
import CreateForm from './CreateForm'
import PreviewGif from './PreviewGif'
import { makeStyles } from '@material-ui/styles'
import Webcam from 'react-webcam'
import { formSelector } from '../redux/form/form.selector'
import { useSelector, useDispatch } from 'react-redux'
import { previewSelector } from '../redux/preview/preview.selector'
import { flexbox } from '@material-ui/system'
import { pendingPreview, newPreview } from '../redux/preview/preview.action'
import { generateGif } from '../services/gif.service'
import { after } from 'eol'
import { CameraProvider, useCameraContext } from '../contexts/CameraContext'

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

const CreateGifs = () => {
    const classes = useStyles()
    const dispatch = useDispatch()

    /** State variables */
    const [tabValue, setTabValue] = useState(0)

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue)
    }
    return (
        <Grid container spacing={3} className={classes.main}>
            <Grid item xs={12} lg={12}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="simple tabs example" className={classes.tabs}>
                    <Tab label="Webcam" {...a11yProps(0)} />
                    <Tab label="Video" {...a11yProps(1)} />
                </Tabs>
                <TabPanel value={tabValue} index={0}>
                    <Grid container style={{ width: '100vw', flexWrap: 'wrap' }}>
                        <Grid item xs={12} md={7} lg={7} style={{ marginBottom: '25px' }}>
                            <CreateForm />
                        </Grid>

                        {/* <Grid item xs={12} md={4} lg={4} style={{ paddingLeft: '16px' }}> */}
                        <PreviewGif />
                        {/* </Grid> */}
                    </Grid>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <Typography color="textSecondary" className={classes.tabs}>
                        Coming soon...
                    </Typography>
                </TabPanel>
            </Grid>
        </Grid>
    )
}

export default CreateGifs
