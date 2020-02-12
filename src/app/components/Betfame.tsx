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
import { FormControl, Select, MenuItem, InputLabel, Typography } from '@material-ui/core'
import overUnderStats from './betfame/overunder'
import { makeStyles, createStyles } from '@material-ui/styles'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts'

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

    const getOverUnderData = tipster => {
        let data = overUnderStats[tipster]
        let result = { OVER: [], UNDER: [] }
        for (let tipType in data) {
            for (let tipGoal in data[tipType]) {
                let r = { name: tipGoal, total: data[tipType][tipGoal].count, wins: data[tipType][tipGoal].wins }
                result[tipType].push(r)
            }
        }
        return result
    }

    const tipsters = Object.keys(overUnderStats)
    const { OVER, UNDER } = getOverUnderData(tipsters[0])
    const [currentTipster, setCurrentTipster] = React.useState(tipsters[0])
    const [overData, setOverData] = React.useState(OVER)
    const [underData, setUnderData] = React.useState(UNDER)

    const handleChange = e => {
        setCurrentTipster(e.target.value)
        let overUnderData = getOverUnderData(e.target.value)
        setOverData(overUnderData.OVER)
        setUnderData(overUnderData.UNDER)
    }

    return (
        <>
            <FormControl style={{ marginBottom: 20 }}>
                <InputLabel id="demo-simple-select-label">Tipster</InputLabel>
                <Select labelId="demo-simple-select-label" id="demo-simple-select" value={currentTipster} onChange={handleChange}>
                    {tipsters.map(tipster => (
                        <MenuItem value={tipster}>{tipster}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Typography variant="h6" style={{ marginBottom: 20 }}>
                Over
            </Typography>
            <BarChart width={730} height={250} data={overData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" />
                <Bar dataKey="wins" fill="#82ca9d" />
            </BarChart>
            <Typography variant="h6" style={{ marginBottom: 20 }}>
                Under
            </Typography>
            <BarChart width={730} height={250} data={underData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" />
                <Bar dataKey="wins" fill="#82ca9d" />
            </BarChart>
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
        </>
    )
}
