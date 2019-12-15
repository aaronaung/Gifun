import React from 'react'
import { string } from 'prop-types'

interface ISnackbarPlacement {
    vertical: 'bottom' | 'top'
    horizontal: 'right' | 'left' | 'center'
}
interface ISnackbarProps {
    anchorOrigin: ISnackbarPlacement
    autoHideDuration: number
    message: any
    action: [any]
    variant: 'success' | 'error' | 'warning' | 'info'
    className: any
}
interface ISnackbarContext {
    isOpen: boolean
    openSnackbar: (props: ISnackbarProps) => void
    closeSnackbar: () => void
    snackbarProps: ISnackbarProps
}

const SnackbarContext = React.createContext(null)
function useSnackbarContext(): ISnackbarContext {
    const context = React.useContext(SnackbarContext)
    if (!context) {
        throw new Error(`useSnackbarContext must be used within a SnackbarProvider`)
    }
    return context
}

function SnackbarProvider(props) {
    const [open, setOpen] = React.useState(false)
    const defaultProps: ISnackbarProps = {
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
        },
        message: 'No snackbar message',
        action: [],
        variant: 'success',
        className: '',
        autoHideDuration: 4000,
    }
    const [snackbarProps, setSnackbarProps] = React.useState(defaultProps)

    const openSnackbar = (props: ISnackbarProps) => {
        setOpen(false)
        setSnackbarProps({ ...defaultProps, ...props })
        setOpen(true)
    }

    const closeSnackbar = () => {
        setOpen(false)
    }

    const isOpen = open

    const value = { isOpen, openSnackbar, closeSnackbar, snackbarProps }
    return <SnackbarContext.Provider value={value} {...props} />
}

export { SnackbarProvider, useSnackbarContext }
export default SnackbarContext
