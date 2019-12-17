import React, { useCallback, useState, useRef, useEffect } from 'react'
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
import {
    Tooltip,
    CircularProgress,
    TextField,
    DialogTitle,
    DialogContent,
    FormControl,
    Input,
    InputAdornment,
} from '@material-ui/core'
import { deleteUserGifs, getGaiaHubUrl } from '../services/gif.service'
import { getUser } from '../services/auth'
import ShareIcon from '@material-ui/icons/Share'
import AssignmentIcon from '@material-ui/icons/Assignment'
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn'
import * as _ from 'lodash'
import { useSnackbarContext } from '../contexts/SnackbarContext'
import clsx from 'clsx'

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
            height: 45,
            cursor: 'pointer',
            padding: 0,
            '& .MuiSvgIcon-root': {
                fontSize: 30,
                color: theme.colors.default,
            },
        },
        deleting: {
            opacity: 0.3,
        },
        loadingIcon: {
            position: 'absolute',
        },
        copyBoard: {
            // width: 'fit-content',
        },
        downloadBtn: {
            '&:hover .MuiSvgIcon-root': {
                color: `${theme.colors.success} !important`,
            },
        },
        deleteBtn: {
            '&:hover .MuiSvgIcon-root': {
                color: `${theme.colors.danger} !important`,
            },
        },
        shareBtn: {
            '&:hover .MuiSvgIcon-root': {
                color: `white !important`,
            },
        },
    })
)

const Transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

const CopyBoard = function({ open, setOpen, shareableLink }) {
    const classes = useStyles()
    const linkRef = useRef(null)
    const [copied, setCopied] = useState(false)
    const { openSnackbar } = useSnackbarContext()

    const handleCopy = () => {
        if (linkRef) {
            linkRef.current.select()
            document.execCommand('copy')
            linkRef.current.blur()
            setCopied(true)
            openSnackbar({ message: 'Copied to clipboard', variant: 'success' })
        }
    }

    return (
        <Dialog
            fullWidth
            className={classes.copyBoard}
            aria-labelledby="dialog"
            open={open}
            onBackdropClick={() => {
                setOpen(false)
                setTimeout(() => setCopied(false), 1000)
            }}
        >
            <DialogTitle id="dialog">Share it with your friends!</DialogTitle>
            <DialogContent style={{ paddingBottom: 20 }}>
                <Typography style={{ marginBottom: 10 }} color="error">
                    Anyone with the link below can view this GIF
                </Typography>
                <TextField
                    inputRef={linkRef}
                    fullWidth
                    variant="outlined"
                    value={shareableLink}
                    InputProps={{
                        endAdornment: (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Tooltip title={copied ? `Copied` : `Copy to Clipboard`}>
                                    {copied ? (
                                        <AssignmentTurnedInIcon
                                            style={{ color: '#66bb6a', marginLeft: 15 }}
                                            fontSize="large"
                                        ></AssignmentTurnedInIcon>
                                    ) : (
                                        <AssignmentIcon
                                            style={{ cursor: 'pointer', marginLeft: 15 }}
                                            color="secondary"
                                            fontSize="large"
                                            onClick={handleCopy}
                                        ></AssignmentIcon>
                                    )}
                                </Tooltip>
                            </div>
                        ),
                    }}
                ></TextField>
            </DialogContent>
        </Dialog>
    )
}

export default function GifLightBox({ gif, open, setOpen, setGifs }) {
    const classes = useStyles()
    const { identityAddress: userId } = getUser()
    const gaiaHubUrl = getGaiaHubUrl()
    const [deleting, setDeleting] = useState(false)
    const [openCopyBoard, setOpenCopyBoard] = useState(false)
    const shareableLink = gif && `${gaiaHubUrl}/gifs/${gif.id}/blob`

    const handleClose = () => {
        setOpen(false)
    }

    const handleDelete = async () => {
        if (gif) {
            setDeleting(true)
            let deletedIds = await deleteUserGifs([gif.id], userId)
            let gifDate = new Date(gif.createdAt).toDateString()
            setGifs(state => {
                let newState = { ...state }

                delete newState[gifDate][gif.id]
                if (_.isEmpty(newState[gifDate])) {
                    delete newState[gifDate]
                }
                return newState
            })
            setDeleting(false)
            setOpen(false)
        }
    }

    const handleShare = async () => {
        setOpenCopyBoard(true)
    }

    return (
        <div>
            <CopyBoard open={openCopyBoard} setOpen={setOpenCopyBoard} shareableLink={shareableLink}></CopyBoard>
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
                                download={`gifun-${(gif && gif.id) || ''}.gif`}
                                href={(gif && gif.b64) || ''}
                                style={{ textDecoration: 'none' }}
                            >
                                <Button className={clsx(classes.actionBtn, classes.downloadBtn)}>
                                    <DownloadIcon></DownloadIcon>
                                </Button>
                            </a>
                        </Tooltip>
                        <Tooltip title={<Typography variant="subtitle2">Delete</Typography>}>
                            <span>
                                <Button
                                    onClick={handleDelete}
                                    className={clsx(classes.actionBtn, classes.deleteBtn)}
                                    disabled={deleting}
                                >
                                    <DeleteIcon></DeleteIcon>
                                </Button>
                            </span>
                        </Tooltip>
                        <Tooltip title={<Typography variant="subtitle2">Share</Typography>}>
                            <span>
                                <Button
                                    onClick={handleShare}
                                    className={clsx(classes.actionBtn, classes.shareBtn)}
                                    disabled={deleting}
                                >
                                    <ShareIcon></ShareIcon>
                                </Button>
                            </span>
                        </Tooltip>
                    </Toolbar>
                </AppBar>

                {gif ? (
                    <div className={classes.gifContainer}>
                        {deleting ? <CircularProgress className={classes.loadingIcon}></CircularProgress> : ''}
                        <img src={gif.b64} className={classes.gif} className={deleting ? classes.deleting : ''} alt="" />
                    </div>
                ) : (
                    ''
                )}
            </Dialog>
        </div>
    )
}
