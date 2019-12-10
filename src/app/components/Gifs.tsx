import React, { useEffect, useState } from 'react'
import { getUser } from '../services/auth'
import { getUserGifs } from '../services/gif.service'
import GifsGrid from './GifsGrid'
import { useDispatch, useSelector } from 'react-redux'
import { addGifs, removeGifs } from '../redux/gifs/gifs.action'
import { gifsSelector } from '../redux/gifs/gifs.selector'

const Gifs = () => {
    const { identityAddress: userId } = getUser()
    const dispatch = useDispatch()
    const gifs = useSelector(state => gifsSelector(state))
    const [skeletonNum, setSkeletonNum] = useState(0)
    const [datedGifs, setDatedGifs] = useState({}) /** sorted by date */

    const mapGifToDate = gif => {}

    const fetchUserGifs = async () => {
        let resp = await getUserGifs(userId)
        let gifIds = resp.gifIds
        let gifProps = resp.gifProps
        setSkeletonNum(gifIds.length)
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
                setSkeletonNum(state => state - 1)
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
                console.log('ALL LOADED')
            },
        })
    }

    useEffect(() => {
        fetchUserGifs()
    }, [])

    return <GifsGrid skeletonNum={skeletonNum} datedGifs={datedGifs} />
}

export default Gifs
