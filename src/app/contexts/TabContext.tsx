import React from 'react'
import { useDispatch } from 'react-redux'
import { resetForm } from '../redux/form/form.action'
import { removePreview } from '../redux/preview/preview.action'

const TabContext = React.createContext(null)

interface TabContext {
    tabState: boolean
    setTabState: any
}

function useTabContext(): TabContext {
    const context = React.useContext(TabContext)
    if (!context) {
        throw new Error(`useTabContext must be used within a CameraProvider`)
    }
    return context
}

function TabProvider(props) {
    const [tab, setTab] = React.useState(0)
    const tabState = tab
    const dispatch = useDispatch()
    const setTabState = state => {
        if (state !== tab) {
            dispatch(resetForm())
            dispatch(removePreview())
        }
        setTab(state)
    }
    const value = { tabState, setTabState }
    return <TabContext.Provider value={value} {...props} />
}

export { TabProvider, useTabContext }
export default TabContext
