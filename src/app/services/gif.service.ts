import gifShot from 'gifShot'
import { GetAllGifsResponseInterface, GifInterface } from '../interfaces/Gifs.interface'
import { putFile, getFile, deleteFile } from 'blockstack'
import { v4 as uuid } from 'uuid'
import { error } from '../utils/response'
import { of } from 'rxjs'
import { mergeAll, map } from 'rxjs/operators'

const USER_PATH = 'users'
const GIFS_PATH = 'gifs'

/**
 * /user/{id}/gifs - [ gifids ]
 * /gifs/{id} - {b64, id, createdAt, properties}
 */

const _massageGIFProps = props => {
    let newProps = { ...props }
    if (newProps.textBaseline === 'custom') {
        delete newProps.textBaseline
        newProps.textXCoordinate = parseInt(newProps.textXCoordinate)
        newProps.textYCoordinate = parseInt(newProps.textYCoordinate)
    } else {
        delete newProps.textXCoordinate
        delete newProps.textYCoordinate
    }
    newProps = { ...newProps, fontSize: `${props.fontSize || 20}px`, numFrames: 15, sampleInterval: 8 }
    return newProps
}

export const generateGif = props => {
    let newProps = _massageGIFProps(props)
    return new Promise((resolve, reject) => {
        gifShot.createGIF(newProps, obj => {
            if (!obj.error) {
                resolve(obj.image)
            } else {
                reject(obj.error)
            }
        })
    })
}

export const getUserGIFIds = async (userId: any): [string] => {
    let allGifIdss = await getFile(`${USER_PATH}/${userId}/gifs`)
    return JSON.parse(allGifIdss || '[]')
}

export const uploadGifForUser = async (props, b64: string, userId: any): Promise<GifInterface> => {
    try {
        let userGifs = await getUserGIFIds(userId)
        let gifId = uuid()
        userGifs.push(gifId)
        let uploadGif = putFile(`${GIFS_PATH}/${gifId}`, JSON.stringify({ ...props, createdAt: Date.now() }))
        /** store b64 separately to avoid json.stringify on a large string */
        let uploadGifB64 = putFile(`${GIFS_PATH}/${gifId}/b64`, b64)
        let updateUserGifs = putFile(`${USER_PATH}/${userId}/gifs`, JSON.stringify(userGifs))
        let uploadAndUpdate = await Promise.all([uploadGif, updateUserGifs])
        return { id: gifId, ...props, b64 }
    } catch (err) {
        return error(err.message)
    }
}

export const getUserGifs = async (userId: any): GetAllGifsResponseInterface => {
    let gifIds = JSON.parse(await getFile(`${USER_PATH}/${userId}/gifs`))
    if (!gifIds) {
        return []
    } else {
        /** @return a promise that awaits a get, and resolves with id mapping to the data if successful */
        const mapPropsToB64 = (props, getB64) => {
            return new Promise(async (resolve, reject) => {
                try {
                    let b64 = await getB64
                    resolve({ ...props, b64 })
                } catch (error) {
                    reject({ id, error })
                }
            })
        }

        const mapIdToProps = (id, getProps) => {
            return new Promise(async (resolve, reject) => {
                try {
                    let props = JSON.parse(await getProps)
                    resolve({ id, ...props })
                } catch (error) {
                    reject({ id, error })
                }
            })
        }

        let getGifProps = gifIds.map(id => mapIdToProps(id, getFile(`${GIFS_PATH}/${id}`)))
        let gifProps = await Promise.all(getGifProps)

        let getGifs = gifProps.map(props => mapPropsToB64(props, getFile(`${GIFS_PATH}/${props.id}/b64`)))
        let $getGifs = of.apply(this, getGifs).pipe(mergeAll())
        return { gifIds, gifProps, $getGifs }
    }
}

export const deleteUserGifs = async (ids, userId): [string] => {
    try {
        let gifIds = JSON.parse(await getFile(`${USER_PATH}/${userId}/gifs`))
        let newGifIds = _.xor(gifIds, ids)
        let updateUserGifs = putFile(`${USER_PATH}/${userId}/gifs`, JSON.stringify(newGifIds))
        let deleteGifProps = ids.map(id => deleteFile(`${GIFS_PATH}/${id}`))
        let deleteGifB64s = ids.map(id => deleteFile(`${GIFS_PATH}/${id}/b64`))

        await Promise.all([...deleteGifB64s, ...deleteGifProps, updateUserGifs])
        return ids
    } catch (err) {
        return error(err.message)
    }

    console.log(gifIds, newGifIds)
}
