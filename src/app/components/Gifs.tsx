import React, { useEffect, useState } from 'react'
import { getUser } from '../services/auth'
import { getUserGifs } from '../services/gif.service'
import GifsGrid from './GifsGrid'
import { useDispatch, useSelector } from 'react-redux'
import { addGifs, removeGifs } from '../redux/gifs/gifs.action'
import { gifsSelector } from '../redux/gifs/gifs.selector'
import { useSnackbarContext } from '../contexts/SnackbarContext'

const Gifs = () => {
    const { identityAddress: userId } = getUser()
    const dispatch = useDispatch()
    const gifs = useSelector(state => gifsSelector(state))
    const [datedGifs, setDatedGifs] = useState({}) /** sorted by date */
    const [loading, setLoading] = useState(false)
    const { openSnackbar } = useSnackbarContext()

    const fetchUserGifs = async () => {
        setLoading(true)
        let resp = await getUserGifs(userId)
        setLoading(false)
        let gifIds = resp.gifIds
        let gifProps = resp.gifProps
        if (gifIds.length > 0) {
            for (let i = 0; i < gifProps.length; i++) {
                /** Set up gif skeletons (without b64) */
                let gif = gifProps[i]
                if (gif.createdAt) {
                    let dateString = new Date(gif.createdAt).toDateString()
                    setDatedGifs(datedGifs => {
                        let newDatedGifs = { ...datedGifs }
                        let idMappedGif = { [gif.id]: gif }
                        newDatedGifs[dateString] = newDatedGifs[dateString]
                            ? { ...newDatedGifs[dateString], ...idMappedGif }
                            : idMappedGif
                        return newDatedGifs
                    })
                }
            }

            resp.$getGifs.subscribe({
                next: gif => {
                    if (gif.createdAt) {
                        /** Back fill b64s in the dated Gifs map */
                        let dateString = new Date(gif.createdAt).toDateString()
                        setDatedGifs(datedGifs => {
                            let newDatedGifs = { ...datedGifs }
                            newDatedGifs[dateString][gif.id].b64 = gif.b64
                            return newDatedGifs
                        })
                    }
                },
                complete: () => {
                    openSnackbar({
                        message: 'Successfully fetched all GIFs',
                        variant: 'success',
                    })
                },
            })
        }
    }

    useEffect(() => {
        fetchUserGifs()
    }, [])

    return <GifsGrid datedGifs={datedGifs} setDatedGifs={setDatedGifs} loading={loading} />
}

export default Gifs
