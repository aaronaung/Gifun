import React, { useEffect } from 'react'
import { getUser } from '../services/auth'
import { getUserGifs } from '../services/gif.service'
import GifsGrid from './GifsGrid'
import { useDispatch, useSelector } from 'react-redux'
import { addGifs } from '../redux/gifs/gifs.action'
import { gifsSelector } from '../redux/gifs/gifs.selector'

const Gifs = () => {
    const { identityAddress: userId } = getUser()
    const dispatch = useDispatch()

    const fetchUserGifs = async () => {
        let resp = await getUserGifs(userId)
        resp.$getGifs.subscribe({
            next: gif => {
                dispatch(addGifs([gif]))
            },
        })
    }

    useEffect(() => {
        fetchUserGifs()
    }, [])

    return <GifsGrid />
}

export default Gifs
