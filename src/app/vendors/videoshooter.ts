import Animated_GIF from './animatedGif.js'

export default function VideoShooter(videoElement, gifWidth, gifHeight, videoWidth, videoHeight, crop, props) {
    this.getShot = function(callback, numFrames, interval, progressCallback) {
        const { text, textBaseline, fontColor, fontWeight, fontSize, fontFamily } = props
        const textAlign = 'center'
        const font = fontWeight + ' ' + fontSize + ' ' + fontFamily
        numFrames = numFrames !== undefined ? numFrames : 3
        interval = interval !== undefined ? interval : 0.1 // In seconds

        var canvas = document.createElement('canvas')
        canvas.width = gifWidth
        canvas.height = gifHeight
        var context = canvas.getContext('2d')

        var pendingFrames = numFrames
        var ag = new Animated_GIF()
        ag.setSize(gifWidth, gifHeight)
        ag.setDelay(interval)

        var sourceX = Math.floor(crop.scaledWidth / 2)
        var sourceWidth = videoWidth - crop.scaledWidth
        var sourceY = Math.floor(crop.scaledHeight / 2)
        var sourceHeight = videoHeight - crop.scaledHeight

        var captureFrame = function() {
            var framesLeft = pendingFrames - 1
            if (framesLeft > 0) {
                setTimeout(captureFrame, interval * 1000) // timeouts are in milliseconds
            }
            var textXCoordinate = props.textXCoordinate
                ? props.textXCoordinate
                : textAlign === 'left'
                ? 1
                : textAlign === 'right'
                ? gifWidth
                : gifWidth / 2
            var textYCoordinate = props.textYCoordinate
                ? props.textYCoordinate
                : textBaseline === 'top'
                ? 1
                : textBaseline === 'center'
                ? gifHeight / 2
                : gifHeight
            context.drawImage(videoElement, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, gifWidth, gifHeight)
            if (text) {
                context.font = font
                context.fillStyle = fontColor
                context.textAlign = 'center'
                context.textBaseline = textBaseline
                context.fillText(text, textXCoordinate, textYCoordinate)
            }
            ag.addFrameImageData(context.getImageData(0, 0, gifWidth, gifHeight))
            pendingFrames = framesLeft

            // Call back with an r value indicating how far along we are in capture
            progressCallback((numFrames - pendingFrames) / numFrames)

            if (!pendingFrames) {
                ag.getBase64GIF(function(image) {
                    // Ensure workers are freed-so we avoid bug #103
                    // https://github.com/meatspaces/meatspace-chat/issues/103
                    ag.destroy()
                    callback(image)
                })
            }
        }

        captureFrame()
    }
}

VideoShooter.getCropDimensions = function(width, height, gifWidth, gifHeight) {
    var result = { width: 0, height: 0, scaledWidth: 0, scaledHeight: 0 }
    if (width > height) {
        result.width = Math.round(width * (gifHeight / height)) - gifWidth
        result.scaledWidth = Math.round(result.width * (height / gifHeight))
    } else {
        result.height = Math.round(height * (gifWidth / width)) - gifHeight
        result.scaledHeight = Math.round(result.height * (width / gifWidth))
    }

    return result
}
