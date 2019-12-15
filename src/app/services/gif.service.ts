import gifShot from 'gifShot'
import { GetAllGifsResponseInterface, GifInterface } from '../interfaces/Gifs.interface'
import { putFile, getFile, deleteFile } from 'blockstack'
import { v4 as uuid } from 'uuid'
import { error } from '../utils/response'
import { of } from 'rxjs'
import { mergeAll, map } from 'rxjs/operators'
import * as _ from 'lodash'
import { gaiaPut } from './http.service'

const USER_PATH = 'users'
const GIFS_PATH = 'gifs'

/**
 * /user/{id}/gifs - [ gifids ]
 * /gifs/{id} - {b64, id, createdAt, properties}
 */

export const getGaiaHubUrl = () => {
    let blockStackSession = JSON.parse(localStorage.getItem('blockstack-session'))
    let gaiaHubConfig = blockStackSession.userData.gaiaHubConfig
    return `${gaiaHubConfig.url_prefix}${gaiaHubConfig.address}`
}

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

const b64ToBlob = b64 => {
    let byteString = atob(b64.split(',')[1])
    // write the bytes of the string to an ArrayBuffer
    let ab = new ArrayBuffer(byteString.length)
    let ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }

    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ab], { type: 'image/gif' })
}

const constructHTMLSharable = (b64, imageLink) => {
    let htmlText = `
        <meta property="og:type" content="website"/>
        <meta property="og:title" content="Gifuru GIF"></meta>
        <meta property="og:image" content="${imageLink}"/>
        <meta property="og:type" content="video.other"/>
        <meta property="og:url" content="${imageLink}"/>
        <meta property="og:site_name" content="Gifuru"/>
        <meta property="og:description" content="Get your personalized GIF content with Gifuru."/>
        <img src=${b64}></img>`
    return htmlText
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
        let gifId = uuid()
        let gifBlob = b64ToBlob(b64)
        let gaiaHubUrl = getGaiaHubUrl()
        let htmlText = constructHTMLSharable(b64, `${gaiaHubUrl}/${GIFS_PATH}/${gifId}/blob`)
        let userGifs = await getUserGIFIds(userId)
        userGifs.push(gifId)

        let uploadGifProps = putFile(`${GIFS_PATH}/${gifId}`, JSON.stringify({ ...props, createdAt: Date.now() }))
        let uploadGifB64 = putFile(`${GIFS_PATH}/${gifId}/b64`, b64)
        let updateGifList = putFile(`${USER_PATH}/${userId}/gifs`, JSON.stringify(userGifs))
        let uploadGifBlob = putFile(`${GIFS_PATH}/${gifId}/blob`, gifBlob, { contentType: 'image/gif', encrypt: false })
        // let uploadShareableHTML = putFile(`${GIFS_PATH}/${gifId}/shared`, htmlText, { contentType: 'text/html', encrypt: false })

        await Promise.all([uploadGifProps, uploadGifB64, updateGifList, uploadGifBlob])
        return { id: gifId, ...props, b64 }
    } catch (err) {
        console.log(err)
        return error(err.message)
    }
}

export const getUserGifs = async (userId: any): GetAllGifsResponseInterface => {
    let gifIds = JSON.parse(await getFile(`${USER_PATH}/${userId}/gifs`))
    if (!gifIds) {
        return { gifIds: [], gifProps: [], $getGifs: null }
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
        // let deleteShareableHtmls = ids.map(id => deleteFile(`${GIFS_PATH}/${gifId}/shared`))
        let deleteGifBlobs = ids.map(id => deleteFile(`${GIFS_PATH}/${gifId}/blob`))
        await Promise.all([...deleteGifB64s, ...deleteGifProps, ...deleteShareableHtmls, ...deleteGifBlobs, updateUserGifs])
        return ids
    } catch (err) {
        return error(err.message)
    }

    console.log(gifIds, newGifIds)
}
