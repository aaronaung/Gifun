import React from 'react'
import MaterialTable, { Column } from 'material-table'
import seniors from './betfame/seniors'
import premiums from './betfame/premiums'
import { forwardRef } from 'react'

import AddBox from '@material-ui/icons/AddBox'
import ArrowDownward from '@material-ui/icons/ArrowDownward'
import Check from '@material-ui/icons/Check'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import Clear from '@material-ui/icons/Clear'
import DeleteOutline from '@material-ui/icons/DeleteOutline'
import Edit from '@material-ui/icons/Edit'
import FilterList from '@material-ui/icons/FilterList'
import FirstPage from '@material-ui/icons/FirstPage'
import LastPage from '@material-ui/icons/LastPage'
import Remove from '@material-ui/icons/Remove'
import SaveAlt from '@material-ui/icons/SaveAlt'
import Search from '@material-ui/icons/Search'
import ViewColumn from '@material-ui/icons/ViewColumn'
import { FormControl, Select, MenuItem, InputLabel, Typography, Grid, Tabs, Tab, Box, TextField } from '@material-ui/core'
import betFameData from './betfame/data'
import { makeStyles, createStyles } from '@material-ui/styles'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts'
import { Autocomplete } from '@material-ui/lab'

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
}

interface Row {
    name: string
    surname: string
    birthYear: number
    birthCity: number
}

interface TableState {
    columns: Array<Column<Row>>
    data: Row[]
}

function BarStats({ data, title }) {
    const renderStats = () => {
        if (data.length === 0) {
            return (
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 200,
                        width: '100%',
                        background: 'grey',
                    }}
                >
                    <Typography variant="subtitle1" style={{ textAlign: 'center', color: 'white' }}>
                        No Data
                    </Typography>
                </Box>
            )
        } else {
            return (
                <BarChart width={730} height={250} data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" />
                    <Bar dataKey="wins" fill="#82ca9d" />
                </BarChart>
            )
        }
    }
    return (
        <>
            <Typography variant="h6" style={{ marginBottom: 20 }}>
                {title}
            </Typography>
            {renderStats()}
        </>
    )
}

const useStyles = makeStyles((theme: Theme) => ({
    main: {
        '& .MuiInputBase-root': {
            width: 300,
            marginBottom: 20,
        },
    },
}))

function TipstersStats({ stats, tabIndex }) {
    const getTableData = (tipster, type) => {
        let data = null
        let result = null
        if (type === 'overUnder') {
            data = stats.overUnderStats[tipster]
            result = { OVER: [], UNDER: [] }
        } else if (type === 'asianHandicap') {
            data = stats.asianHandicapStats[tipster]
            result = { full: [], half: [] }
        } else {
            return
        }
        for (let tipType in data) {
            for (let tipGoal in data[tipType]) {
                let r = { name: tipGoal, total: data[tipType][tipGoal].count, wins: data[tipType][tipGoal].wins }
                result[tipType].push(r)
            }
        }
        return result
    }
    const classes = useStyles()
    const tipsters = Object.keys(stats.asianHandicapStats)
    const initialOverUnderData = getTableData(tipsters[0], 'overUnder')
    const initialAsianHandicapData = getTableData(tipsters[0], 'asianHandicap')

    const [currentTipster, setCurrentTipster] = React.useState(tipsters[0])
    const [overUnderData, setOverUnderData] = React.useState(initialOverUnderData)
    const [asianHandicapData, setAsianHandicapData] = React.useState(initialAsianHandicapData)

    const handleSelectChange = e => {
        setCurrentTipster(e.target.value)
        let overUnderData = getTableData(e.target.value, 'overUnder')
        let asianHandicapData = getTableData(e.target.value, 'asianHandicap')
        setOverUnderData(overUnderData)
        setAsianHandicapData(asianHandicapData)
    }

    return (
        <>
            <div className={classes.main}>
                <Autocomplete
                    id={`tipsters-select-${tabIndex}`}
                    options={tipsters}
                    getOptionLabel={option => option}
                    defaultValue={tipsters[0]}
                    onSelect={handleSelectChange}
                    style={{ width: 200, display: 'inline-flex' }}
                    renderInput={params => <TextField {...params} label="Tipsters" variant="outlined" fullWidth />}
                />
            </div>
            <Grid container spacing={2} style={{ marginBottom: 15 }}>
                <Grid item lg={6}>
                    <BarStats title="Total Goals Over" data={overUnderData.OVER}></BarStats>
                </Grid>
                <Grid item lg={6}>
                    <BarStats title="Total Goals Under" data={overUnderData.UNDER}></BarStats>
                </Grid>
            </Grid>
            <Grid container spacing={2} style={{ marginBottom: 15 }}>
                <Grid item lg={6}>
                    <BarStats title="Asian Handicap Full" data={asianHandicapData.full}></BarStats>
                </Grid>
                <Grid item lg={6}>
                    <BarStats title="Asian Handicap Half" data={asianHandicapData.half}></BarStats>
                </Grid>
            </Grid>
        </>
    )
}

interface TabPanelProps {
    children?: React.ReactNode
    index: any
    value: any
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

export default function Betfame() {
    const [state, setState] = React.useState<TableState>({
        columns: [
            { title: 'Position', field: 'position' },
            { title: 'Tipster', field: 'tipster' },
            { title: 'Num Tips', field: 'noTips', type: 'numeric' },
            { title: 'Hits', field: 'hits', type: 'numeric' },
            { title: 'Profit', field: 'profit', type: 'numeric' },
            { title: 'Odds', field: 'odds', type: 'numeric' },
            { title: 'ROI', field: 'roi', type: 'numeric' },
            { title: 'Wins', field: 'wins', type: 'numeric' },
            { title: 'Losses', field: 'losses', type: 'numeric' },
            { title: 'Draws', field: 'draws', type: 'numeric' },
        ],
        seniors,
        premiums,
    })

    const [tabValue, setTabValue] = React.useState(0)

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue)
    }

    function a11yProps(index: any) {
        return {
            id: `full-width-tab-${index}`,
            'aria-controls': `full-width-tabpanel-${index}`,
        }
    }

    return (
        <div style={{ margin: 20 }}>
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                aria-label="full width tabs example"
                style={{ marginBottom: 15 }}
            >
                <Tab label="Seniors" {...a11yProps(0)} />
                <Tab label="Premiums" {...a11yProps(1)} />
                <Tab label="Overall Stats" {...a11yProps(2)} />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
                <TipstersStats stats={betFameData.seniors} tabIndex={0}></TipstersStats>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <TipstersStats stats={betFameData.premiums} tabIndex={1}></TipstersStats>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <MaterialTable
                    style={{ marginBottom: 20 }}
                    icons={tableIcons}
                    title="Senior Tipsters"
                    options={{ pageSize: 10 }}
                    columns={state.columns}
                    data={state.seniors}
                />
                <MaterialTable
                    icons={tableIcons}
                    title="Premium Tipsters"
                    options={{ pageSize: 10 }}
                    columns={state.columns}
                    data={state.premiums}
                />
            </TabPanel>
        </div>
    )
}
