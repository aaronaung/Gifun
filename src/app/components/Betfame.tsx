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
import betFameData from './betfame/betfame-data-1581982143113'
import { getWinRatesData } from './betfame/winrates'
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

function WinRateTables() {
    const [state, setState] = React.useState<TableState>({
        columns: [
            { title: 'Tipster', field: 'tipster' },
            { title: 'Win Rate', field: 'winRate', defaultSort: 'desc' },
            { title: 'Total Tips', field: 'totalTips', type: 'numeric' },
        ],
    })
    const classes = useStyles()
    const nameMap = {
        'asianHandicapStats-full': 'Asian Handicap Full Time',
        'asianHandicapStats-half': 'Asian Handicap Half Time',
        'overUnderStats-fulltime-OVER': 'Total Goals Full Time Over',
        'overUnderStats-fulltime-UNDER': 'Total Goals Full Time Under',
        'overUnderStats-halftime-OVER': 'Total Goals Half Time Over',
        'overUnderStats-halftime-UNDER': 'Total Goals Half Time Under',
        'fixedOddStats-full': 'Fixed Odd Full Time',
        'fixedOddStats-half': 'Fixed Odd Half Time',
    }
    const [selectState, setSelectState] = React.useState('Premiums')
    const winRateData = getWinRatesData(betFameData)
    console.log(winRateData)
    const getTables = () => {
        return Object.keys(winRateData[selectState.toLowerCase()]).map(gameType => {
            return (
                <Grid item md={4} lg={4}>
                    <MaterialTable
                        style={{ marginBottom: 20 }}
                        icons={tableIcons}
                        title={<Typography variant="caption">{nameMap[gameType]}</Typography>}
                        options={{ pageSize: 5 }}
                        columns={state.columns}
                        data={winRateData[selectState.toLowerCase()][gameType]}
                    />
                </Grid>
            )
        })
    }
    const handleSelectChange = e => {
        setSelectState(e.target.value)
    }
    return (
        <>
            <FormControl variant="outlined" className={classes.formControl} style={{ marginBottom: 20 }}>
                <Select native value={selectState} onChange={handleSelectChange}>
                    <option value={'premiums'}>Premiums</option>
                    <option value={'seniors'}>Seniors</option>
                </Select>
            </FormControl>
            <div>
                <Grid container spacing={2} style={{ marginBottom: 15 }}>
                    {getTables()}
                    {/* {getTables().map((tbl, i) => {
                        if (i < 3) {
                            return tbl
                        }
                    })} */}
                </Grid>
                {/* <Grid container spacing={2} style={{ marginBottom: 15 }}>
                    {getTables().map((tbl, i) => {
                        if (i >= 3) {
                            return tbl
                        }
                    })}
                </Grid> */}
            </div>
        </>
    )
}

function BarStats({ data, title }) {
    data = data.sort((a, b) => a.name - b.name)
    const totalWins = data.length > 0 ? data.map(d => d.wins).reduce((a, b) => a + b) : 0
    const totalLosses = data.length > 0 ? data.map(d => d.losses).reduce((a, b) => a + b) : 0
    const winRate = ((totalWins * 100) / (totalWins + totalLosses)).toFixed(2)
    const totalTips = totalWins + totalLosses

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
                <BarChart width={600} height={250} data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar stackId="x" dataKey="losses" fill="#d44249" />
                    <Bar stackId="x" dataKey="wins" fill="#82ca9d" />
                </BarChart>
            )
        }
    }
    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" style={{ marginBottom: 20 }}>
                    {title}
                </Typography>
                <Typography variant="subtitle2" style={{ marginBottom: 20, marginLeft: 20 }}>
                    Win Rate: {winRate}%
                </Typography>
                <Typography variant="subtitle2" style={{ marginBottom: 20, marginLeft: 20 }}>
                    Total Tip: {totalTips}
                </Typography>
            </div>
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
        '& .MuiInputLabel-root': {
            backgroundColor: 'white',
        },
    },
}))

function TipstersStats({ stats, tabIndex }) {
    const getTableData = (tipster, type) => {
        let data = null
        let result = null
        if (type === 'overUnderFull') {
            data = stats.overUnderStats[tipster] && stats.overUnderStats[tipster]['fulltime']
            result = { OVER: [], UNDER: [] }
        } else if (type === 'overUnderHalf') {
            data = stats.overUnderStats[tipster] && stats.overUnderStats[tipster]['halftime']
            result = { OVER: [], UNDER: [] }
        } else if (type === 'asianHandicap') {
            data = stats.asianHandicapStats[tipster]
            result = { full: [], half: [] }
        } else {
            return
        }
        for (let tipType in data) {
            for (let tipGoal in data[tipType]) {
                let r = {
                    name: tipGoal,
                    losses: data[tipType][tipGoal].count - data[tipType][tipGoal].wins,
                    wins: data[tipType][tipGoal].wins,
                }
                result[tipType].push(r)
            }
        }
        return result
    }
    const classes = useStyles()
    const tipsters = Object.keys(stats.asianHandicapStats)
    const initialOverUnderData = {
        fulltime: getTableData(tipsters[0], 'overUnderFull'),
        halftime: getTableData(tipsters[0], 'overUnderHalf'),
    }
    const initialAsianHandicapData = getTableData(tipsters[0], 'asianHandicap')

    const [currentTipster, setCurrentTipster] = React.useState(tipsters[0])
    const [overUnderData, setOverUnderData] = React.useState(initialOverUnderData)
    const [asianHandicapData, setAsianHandicapData] = React.useState(initialAsianHandicapData)

    const handleSelectChange = e => {
        setCurrentTipster(e.target.value)
        let overUnderData = {
            fulltime: getTableData(e.target.value, 'overUnderFull'),
            halftime: getTableData(e.target.value, 'overUnderHalf'),
        }
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
                <Grid item md={12} lg={6}>
                    <BarStats title="Total Goals Fulltime Over" data={overUnderData['fulltime'].OVER}></BarStats>
                </Grid>
                <Grid item md={12} lg={6}>
                    <BarStats title="Total Goals Fulltime Under" data={overUnderData['fulltime'].UNDER}></BarStats>
                </Grid>
            </Grid>
            <Grid container spacing={2} style={{ marginBottom: 15 }}>
                <Grid item md={12} lg={6}>
                    <BarStats title="Total Goals Halftime Over" data={overUnderData['halftime'].OVER}></BarStats>
                </Grid>
                <Grid item md={12} lg={6}>
                    <BarStats title="Total Goals Halftime Under" data={overUnderData['halftime'].UNDER}></BarStats>
                </Grid>
            </Grid>
            <Grid container spacing={2} style={{ marginBottom: 15 }}>
                <Grid item md={12} lg={6}>
                    <BarStats title="Asian Handicap Fulltime" data={asianHandicapData.full}></BarStats>
                </Grid>
                <Grid item md={12} lg={6}>
                    <BarStats title="Asian Handicap Halftime" data={asianHandicapData.half}></BarStats>
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
                <Tab label="Winrates by Game Type" {...a11yProps(0)} />
                <Tab label="Seniors" {...a11yProps(1)} />
                <Tab label="Premiums" {...a11yProps(2)} />
                <Tab label="Overall Stats" {...a11yProps(3)} />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
                <WinRateTables></WinRateTables>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <TipstersStats stats={betFameData.seniors} tabIndex={1}></TipstersStats>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <TipstersStats stats={betFameData.premiums} tabIndex={2}></TipstersStats>
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
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
