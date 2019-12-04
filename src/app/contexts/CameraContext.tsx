import React from 'react'

const CameraContext = React.createContext(null)

function useCameraContext() {
    const context = React.useContext(CameraContext)
    if (!context) {
        throw new Error(`useCameraContext must be used within a CameraProvider`)
    }
    return context
}

function CameraProvider(props) {
    const [cameraState, setCameraState] = React.useState({ on: false, loading: false })

    const value = [cameraState, setCameraState]
    return <CameraContext.Provider value={value} {...props} />
}

export { CameraProvider, useCameraContext }
export default CameraContext
