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
    const gifs = useSelector(state => gifsSelector(state))
    console.log(gifs)

    const fetchUserGifs = async () => {
        let gifs = await getUserGifs(userId)
        dispatch(addGifs(gifs))
    }

    useEffect(() => {
        fetchUserGifs()
    }, [])

    return <GifsGrid gifs={gifs} />
}

export default Gifs
