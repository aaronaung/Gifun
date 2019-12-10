import React, { useEffect, useState } from 'react'
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import IconButton from '@material-ui/core/IconButton'
import StarBorderIcon from '@material-ui/icons/StarBorder'
import { useSelector } from 'react-redux'
import { gifsSelector } from '../redux/gifs/gifs.selector'
import { Grid } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import { format, isToday, compareDesc, parseISO } from 'date-fns'
import GifLightBox from './GifLightBox'

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
}))

export default function GifsGrid({ datedGifs, setDatedGifs }) {
    const classes = useStyles()
    const [openLightBox, setOpenLightBox] = useState(false)
    const [lightBoxGif, setLightBoxGif] = useState(null)

    return (
        <div>
            <GifLightBox open={openLightBox} setOpen={setOpenLightBox} gif={lightBoxGif} setGifs={setDatedGifs}></GifLightBox>
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
