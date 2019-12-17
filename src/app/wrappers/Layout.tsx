import React from 'react'
import clsx from 'clsx'
import { createStyles, makeStyles, useTheme, Theme } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import AddBoxIcon from '@material-ui/icons/AddBox'
import MailIcon from '@material-ui/icons/Mail'
import GifIcon from '@material-ui/icons/Gif'
import FavoriteIcon from '@material-ui/icons/FavoriteOutlined'
import { navigate } from 'gatsby'
import gifunLogo from '../../images/gifun.png'
import { Tooltip } from '@material-ui/core'
import SimpleSnackbar from '../components/Snackbar'
import { isMobile } from 'react-device-detect'

const drawerWidth = 240

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        appBar: {
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            backgroundColor: '#2f2f2f',
        },
        appBarShift: {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        menuButton: {
            marginRight: 40,
            [theme.breakpoints.down('sm')]: {
                marginRight: 10,
            },
        },
        hide: {
            display: 'none',
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            backgroundColor: '#2f2f2f',
        },
        drawerOpen: {
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        drawerClose: {
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
            width: theme.spacing(7) + 1,
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9) + 1,
            },
        },
        gifunLogo: {
            width: 50,
            height: 50,
        },
        toolbar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 1),
            ...theme.mixins.toolbar,
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            height: 'fit-content',
            minHeight: '100vh',
            backgroundColor: '#1f1f1f',
            color: 'white',
            overflow: 'hidden',
            paddingBottom: '80px',
        },
        footer: {
            marginTop: '50px',
            background: '#2f2f2f',
            position: 'fixed',
            bottom: '0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '50px',
            zIndex: 10000,
        },

        addBtn: {
            '&:hover .MuiListItemIcon-root': {
                color: theme.colors.success,
            },
        },
        favoriteBtn: {
            '&:hover .MuiListItemIcon-root': {
                color: theme.palette.secondary.main,
            },
        },
    })
)

export default function MiniDrawer({ children }) {
    const classes = useStyles()
    const theme = useTheme()
    const [open, setOpen] = React.useState(false)

    const handleDrawerOpen = () => {
        setOpen(true)
    }

    const handleDrawerClose = () => {
        setOpen(false)
    }

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}
                    >
                        <MenuIcon />
                    </IconButton>
                    <img src={gifunLogo} className={classes.gifunLogo} alt="" />
                    <Typography variant="h6" color="secondary" noWrap>
                        <b>GIFun</b>
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
                open={open}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </div>
                <Divider />
                <List>
                    <Tooltip title={!open ? <Typography variant="subtitle2">My GIFs</Typography> : ''} placement="right">
                        <ListItem className={clsx(classes.favoriteBtn)} button key={'My Gifs'} onClick={() => navigate('/app')}>
                            <ListItemIcon style={{ paddingLeft: 8 }}>
                                <FavoriteIcon />
                            </ListItemIcon>
                            <ListItemText primary="My Gifs" />
                        </ListItem>
                    </Tooltip>

                    <Tooltip title={!open ? <Typography variant="subtitle2">Create GIFs</Typography> : ''} placement="right">
                        <ListItem
                            className={clsx(classes.addBtn)}
                            button
                            key={'Create Gifs'}
                            onClick={() => navigate('/app/create')}
                        >
                            <ListItemIcon style={{ paddingLeft: 8 }}>
                                <AddBoxIcon />
                            </ListItemIcon>
                            <ListItemText primary="Create Gifs" />
                        </ListItem>
                    </Tooltip>
                </List>
            </Drawer>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                {children}
            </main>
            <div className={classes.footer}>
                <Typography color="textSecondary">© 2019 Gifun, Built just for you </Typography>
            </div>
            <SimpleSnackbar></SimpleSnackbar>
        </div>
    )
}
