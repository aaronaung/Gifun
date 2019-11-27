import React from 'react'
import { Grid, Tab, Typography, Box, Tabs, Theme } from '@material-ui/core'
import CreateForm from './CreateForm'
import PreviewGif from './PreviewGif'
import { makeStyles } from '@material-ui/styles'

interface TabPanelProps {
    children?: React.ReactNode
    index: any
    value: any
}

const useStyles = makeStyles((theme: Theme) => ({
    tabs: {
        paddingLeft: theme.spacing(2),
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
    React.useEffect(() => {
        console.log('CreateGifs COMPONENT LOADED')

        return () => {
            'CreateGifs COMPONENT TORN DOWN'
        }
    }, [])

    const [value, setValue] = React.useState(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue)
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
                <Tabs value={value} onChange={handleChange} aria-label="simple tabs example" className={classes.tabs}>
                    <Tab label="Webcam" {...a11yProps(0)} />
                    <Tab label="Video" {...a11yProps(1)} />
                </Tabs>
                <TabPanel value={value} index={0}>
                    <CreateForm />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <Typography color="textSecondary" className={classes.tabs}>
                        Coming soon...
                    </Typography>
                </TabPanel>
            </Grid>
            <Grid item xs={12} lg={6}>
                <PreviewGif />
            </Grid>
        </Grid>
    )
}

export default CreateGifs
