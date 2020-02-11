import React from 'react'

const LightBoxContext = React.createContext(null)

function useLightBoxContext() {
    const context = React.useContext(LightBoxContext)
    if (!context) {
        throw new Error(`useLightBoxContext must be used within a LightBoxProvider`)
    }
    return context
}

function LightBoxProvider(props) {
    const [open, setOpen] = React.useState(false)
    const openLightBox = () => {}

    const value = { cameraState, setCameraState }
    return <LightBoxContext.Provider value={value} {...props} />
}

export { LightBoxProvider, useLightBoxContext }
export default LightBoxContext
