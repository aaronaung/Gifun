import gifShot from 'gifShot'
import { GIFPropertiesInterface, GIFsObjectInterface } from '../interfaces/Gifs.interface'
import { putFile, getFile, deleteFile } from 'blockstack'
import { v4 as uuid } from 'uuid'
import { error } from '../utils/response'
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

export const generateGif = (props: GIFPropertiesInterface) => {
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
    let allGifs
    allGifs = await getFile(`${USER_PATH}/${userId}/gifs`)
    return JSON.parse(allGifs || '[]')
}

export const uploadGifForUser = async (props: GIFPropertiesInterface, b64: string, userId: any): Promise<GIFsObjectInterface> => {
    try {
        let userGifs = await getUserGIFIds(userId)
        let gifId = uuid()
        userGifs.push(gifId)
        let uploadGif = putFile(`${GIFS_PATH}/${gifId}`, JSON.stringify({ ...props, createdAt: Date.now() }))
        /** store b64 separately to avoid json.stringify on a large string */
        let uploadGifB64 = putFile(`${GIFS_PATH}/${gifId}/b64`, b64)
        let updateUserGifs = putFile(`${USER_PATH}/${userId}/gifs`, JSON.stringify(userGifs))
        let uploadAndUpdate = await Promise.all([uploadGif, updateUserGifs])
        return { [gifId]: { ...props, b64 } }
    } catch (err) {
        return error(err.message)
    }
}

export const getUserGifs = async (userId: any): Promise<GIFsObjectInterface> => {
    let gifIds = await getFile(`${USER_PATH}/${userId}/gifs`)
    if (!gifIds) {
        return []
    } else {
        /** @return a promise that awaits a get, and resolves with id mapping to the data if successful */
        const mapIdToGetCalls = (id, get) => {
            return new Promise(async (resolve, reject) => {
                try {
                    let data = await get
                    resolve({ id, data })
                } catch (error) {
                    reject({ id, error })
                }
            })
        }
        gifIds = JSON.parse(gifIds)
        let getB64s = Promise.all(gifIds.map(id => mapIdToGetCalls(id, getFile(`${GIFS_PATH}/${id}/b64`))))
        let getProps = Promise.all(gifIds.map(id => mapIdToGetCalls(id, getFile(`${GIFS_PATH}/${id}`))))
        let [b64s, props] = await Promise.all([getB64s, getProps])
        let gifs = {}
        b64s.forEach(b64 => {
            gifs[b64['id']] = gifs[b64['id']] ? { ...gifs[b64['id']], b64: b64.data } : { b64: b64.data }
        })
        props.forEach(prop => {
            gifs[prop['id']] = gifs[prop['id']] ? { ...gifs[prop['id']], ...JSON.parse(prop.data) } : { ...JSON.parse(prop.data) }
        })
        return gifs
    }
}
