import React, { useEffect, useState } from 'react'
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import IconButton from '@material-ui/core/IconButton'
import StarBorderIcon from '@material-ui/icons/StarBorder'
import { useSelector } from 'react-redux'
import { gifsSelector } from '../redux/gifs/gifs.selector'
import { Grid, Typography, Button, Tooltip, CircularProgress } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import { format, isToday, compareDesc, parseISO } from 'date-fns'
import GifLightBox from './GifLightBox'
import ihavenothing from '../../images/ihavenothing.gif'
import dontworry from '../../images/dontworry.gif'
import getstarted from '../../images/getstarted.gif'
import clickme from '../../images/clickme.gif'
import { navigate } from 'gatsby'

const GRIDITEM_SIZE = { width: 250, height: 250 }

const useStyles = makeStyles((theme: Theme) => ({
    gif: {
        height: GRIDITEM_SIZE.height,
        marginRight: 20,
        width: GRIDITEM_SIZE.width,
        marginBottom: 20,
        objectFit: 'cover',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    gifsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    centerItems: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        textAlign: 'center',
    },
    funnyGif: {
        height: '200px',
        width: 'auto',
    },
}))

function NoGif() {
    const classes = useStyles()
    return (
        <div className={classes.centerItems}>
            {/* <Typography variant="subtitle">
                
            </Typography> */}
            <div style={{ display: 'flex' }}>
                <img className={classes.funnyGif} src={ihavenothing} alt="" />
                <img className={classes.funnyGif} src={dontworry} alt="" />
                <Tooltip title={<Typography variant="subtitle2">Click here to start</Typography>}>
                    <img
                        onClick={() => navigate('/app/create')}
                        className={classes.funnyGif}
                        style={{ cursor: 'pointer' }}
                        src={clickme}
                        alt=""
                    />
                </Tooltip>
            </div>
        </div>
    )
}

export default function GifsGrid({ datedGifs, setDatedGifs, loading }) {
    const classes = useStyles()
    const [openLightBox, setOpenLightBox] = useState(false)
    const [lightBoxGif, setLightBoxGif] = useState(null)

    return (
        <div>
            <GifLightBox open={openLightBox} setOpen={setOpenLightBox} gif={lightBoxGif} setGifs={setDatedGifs}></GifLightBox>
            {loading ? (
                <div className={classes.centerItems}>
                    <CircularProgress style={{ marginBottom: 10 }}></CircularProgress>
                    <Typography>Loading GIFs...</Typography>
                </div>
            ) : (
                ''
            )}
            {_.isEmpty(datedGifs) && !loading ? <NoGif></NoGif> : ''}
            {Object.keys(datedGifs)
                .map(dateString => new Date(dateString))
                .sort(compareDesc)
                .map(date => {
                    date = date.toDateString()
                    return (
                        <div key={date}>
                            <h2 key={date}>{date}</h2>
                            <div className={classes.gifsContainer}>
                                {Object.keys(datedGifs[date]).map(gifId => {
                                    let gif = datedGifs[date][gifId]
                                    if (gif.b64) {
                                        return (
                                            <div key={`griditem-${gif.id}`}>
                                                <img
                                                    onClick={() => {
                                                        setLightBoxGif(gif)
                                                        setOpenLightBox(true)
                                                    }}
                                                    className={classes.gif}
                                                    src={gif.b64}
                                                    key={gif.id}
                                                    alt={gif.id}
                                                />
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <Skeleton
                                                key={gif.id}
                                                variant="rect"
                                                style={{ marginBottom: 20, marginRight: 20 }}
                                                width={GRIDITEM_SIZE.width}
                                                height={GRIDITEM_SIZE.height}
                                            />
                                        )
                                    }
                                })}
                            </div>
                        </div>
                    )
                })}
        </div>
    )
}
