import React from 'react'
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import IconButton from '@material-ui/core/IconButton'
import StarBorderIcon from '@material-ui/icons/StarBorder'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tile: {
            height: '300px',
            width: 'auto',
        },
        // root: {
        //     display: 'flex',
        //     flexWrap: 'wrap',
        //     justifyContent: 'space-around',
        //     overflow: 'hidden',
        //     backgroundColor: theme.palette.background.paper,
        // },
        // gridList: {
        //     flexWrap: 'nowrap',
        //     // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        //     transform: 'translateZ(0)',
        // },
        // title: {
        //     color: theme.palette.primary.light,
        // },
        // titleBar: {
        //     background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
        // },
    })
)

/**
 * The example data is structured as follows:
 *
 * import image from 'path/to/image.jpg';
 * [etc...]
 *
 * const tileData = [
 *   {
 *     img: image,
 *     title: 'Image',
 *     author: 'author',
 *   },
 *   {
 *     [etc...]
 *   },
 * ];
 */
export default function GifsGrid({ gifs }) {
    const classes = useStyles()
    console.log({ gifs })
    return (
        <div className={classes.root}>
            <GridList className={classes.gridList} cols={2.5}>
                {Object.keys(gifs).map(id => (
                    <GridListTile key={id} className={classes.tile}>
                        <img src={gifs[id].b64} alt="GIFuru GIF" />
                        {/* <GridListTileBar
                            title={tile.title}
                            classes={{
                                root: classes.titleBar,
                                title: classes.title,
                            }}
                            actionIcon={
                                <IconButton aria-label={`star ${tile.title}`}>
                                    <StarBorderIcon className={classes.title} />
                                </IconButton>
                            }
                        /> */}
                    </GridListTile>
                ))}
            </GridList>
        </div>
    )
}
