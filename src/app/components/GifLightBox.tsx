import React, { useCallback } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import DownloadIcon from '@material-ui/icons/CloudDownloadTwoTone'
import DeleteIcon from '@material-ui/icons/DeleteTwoTone'
import Slide from '@material-ui/core/Slide'
import { TransitionProps } from '@material-ui/core/transitions'
import { Tooltip } from '@material-ui/core'
import { deleteUserGifs } from '../services/gif.service'
import { getUser } from '../services/auth'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBar: {
            position: 'relative',
        },
        title: {
            marginLeft: theme.spacing(2),
            flex: 1,
        },
        gif: {
            width: 'fit-content',
        },
        gifContainer: {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: theme.palette.grey[900],
        },
        actionBtn: {
            marginLeft: 30,
            fontSize: 30,
            cursor: 'pointer',
        },
    })
)

const Transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

export default function GifLightBox({ gif, open, setOpen }) {
    const classes = useStyles()
    const { identityAddress: userId } = getUser()

    const handleClose = () => {
        setOpen(false)
    }

    const handleDelete = () => {
        deleteUserGifs([gif && gif.id], userId)
    }

    return (
        <div>
            <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
                <AppBar className={classes.appBar} color="inherit">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            {/** later when gif has names */}
                        </Typography>
                        <Tooltip title={<Typography variant="subtitle2">Download</Typography>}>
                            <a
                                download={`gifuru-${(gif && gif.id) || ''}.gif`}
                                href={(gif && gif.b64) || ''}
                                style={{ textDecoration: 'none' }}
                            >
                                <DownloadIcon
                                    style={{ color: '#66bb6a' }}
                                    className={classes.actionBtn}
                                    fontSize="default"
                                ></DownloadIcon>
                            </a>
                        </Tooltip>
                        <Tooltip title={<Typography variant="subtitle2">Delete</Typography>}>
                            <DeleteIcon
                                style={{ color: '#d32f2f' }}
                                className={classes.actionBtn}
                                fontSize="default"
                                onClick={handleDelete}
                            ></DeleteIcon>
                        </Tooltip>
                    </Toolbar>
                </AppBar>
                <div className={classes.gifContainer}>{gif ? <img src={gif.b64} className={classes.gif} alt="" /> : ''}</div>
            </Dialog>
        </div>
    )
}
