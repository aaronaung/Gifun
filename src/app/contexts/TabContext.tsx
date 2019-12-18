import React from 'react'

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
    const [tabState, setTabState] = React.useState(0)

    const value = { tabState, setTabState }
    return <TabContext.Provider value={value} {...props} />
}

export { TabProvider, useTabContext }
export default TabContext
