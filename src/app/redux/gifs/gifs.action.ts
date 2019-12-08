import { GifInterface } from '../../interfaces/Gifs.interface'

export const ADD_GIFS = 'ADD_GIFS'
export const REMOVE_GIFS = 'REMOVE_GIFS'

export const addGifs = (gifs: [GifInterface]) => {
    return { type: ADD_GIFS, payload: gifs }
}

export const removeGifs = (gifIds: [string]) => {
    return { type: REMOVE_GIFS, payload: gifIds }
}
