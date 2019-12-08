import React from 'react'
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import IconButton from '@material-ui/core/IconButton'
import StarBorderIcon from '@material-ui/icons/StarBorder'
import { useSelector } from 'react-redux'
import { gifsSelector } from '../redux/gifs/gifs.selector'
import { Grid } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) => ({
    gif: {
        height: '250px',
        marginRight: '20px',
        width: 'auto',
    },
    gifsContainer: {
        display: 'flex',
    },
}))

export default function GifsGrid() {
    const classes = useStyles()
    const gifs = useSelector(state => gifsSelector(state))
    return (
        <div className={classes.gifsContainer}>
            {gifs.map(gif => {
                return (
                    // <Grid key={`grid-item-${gif.id}`} item lg={2}>
                    <img className={classes.gif} src={gif.b64} key={gif.id} alt={gif.id} />
                    // </Grid>
                )
            })}
        </div>
    )
}
