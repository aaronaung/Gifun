import EXIF from 'exif-js'

export const error = msg => ({ error: msg })

export const b64ToBlob = b64 => {
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

export const getGaiaHubUrl = () => {
    let blockStackSession = JSON.parse(localStorage.getItem('blockstack-session'))
    let gaiaHubConfig = blockStackSession.userData.gaiaHubConfig
    if (gaiaHubConfig) {
        return `${gaiaHubConfig.url_prefix}${gaiaHubConfig.address}`
    } else {
        return {}
    }
}

export const getExif = b64 => {
    return new Promise((resolve, reject) => {
        let image = new Image()
        image.onload = function() {
            EXIF.getData(image, function() {
                resolve(EXIF.getAllTags(this))
            })
        }
        image.src = `data:image/jpeg;base64,${b64}`
    })
}
