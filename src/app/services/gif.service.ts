import gifShot from 'gifShot'
import { CreateGifConfigInterface } from '../interfaces/CreateGifConfigInterface'

export const generateGif = (config: CreateGifConfigInterface) => {
    return new Promise((resolve, reject) => {
        let newConfig = { ...config, fontSize: `${config.fontSize}px` }
        gifShot.createGIF(newConfig, obj => {
            if (!obj.error) {
                resolve(obj.image)
            } else {
                reject(obj.error)
            }
        })
    })
}
