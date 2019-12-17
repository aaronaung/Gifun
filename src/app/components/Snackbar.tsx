import React from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import InfoIcon from '@material-ui/icons/Info'
import WarningIcon from '@material-ui/icons/Warning'
import { useSnackbarContext } from '../contexts/SnackbarContext'
import { green, amber, yellow } from '@material-ui/core/colors'
import clsx from 'clsx'
import { SnackbarContent, Typography } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        zIndex: 10001,
    },
    close: {
        padding: theme.spacing(0.5),
        color: 'white',
    },
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.main,
    },
    warning: {
        backgroundColor: yellow[900],
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing(1),
    },
    message: {
        display: 'flex',
        alignItems: 'center',
        color: 'white',
    },
}))

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
}

export default function SimpleSnackbar() {
    const classes = useStyles()
    const { isOpen, openSnackbar, closeSnackbar, snackbarProps } = useSnackbarContext()
    const Icon = variantIcon[snackbarProps.variant]
    const handleClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return
        }
        closeSnackbar()
    }

    return (
        <div>
            <Snackbar
                anchorOrigin={snackbarProps.anchorOrigin}
                open={isOpen}
                autoHideDuration={snackbarProps.autoHideDuration}
                onClose={handleClose}
                className={clsx(classes.root)}
            >
                <SnackbarContent
                    action={[
                        ...snackbarProps.action,
                        <IconButton
                            key="close"
                            aria-label="close"
                            color="inherit"
                            className={classes.close}
                            onClick={handleClose}
                        >
                            <CloseIcon />
                        </IconButton>,
                    ]}
                    message={
                        <span id="client-snackbar" className={classes.message}>
                            <Icon className={clsx(classes.icon, classes.iconVariant)} />
                            <Typography variant="subtitle1">{snackbarProps.message}</Typography>
                        </span>
                    }
                    className={clsx(classes[snackbarProps.variant], snackbarProps.className)}
                ></SnackbarContent>
            </Snackbar>
        </div>
    )
}
