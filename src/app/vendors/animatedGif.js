// A library/utility for generating GIF files
// Uses Dean McNamee's omggif library
// and Anthony Dekker's NeuQuant quantizer (JS 0.3 version with many fixes)
//
// @author sole / http://soledadpenades.com
function Animated_GIF(options) {
    options = options || {}

    var GifWriter = require('omggif').GifWriter

    var width = options.width || 160
    var height = options.height || 120
    var dithering = options.dithering || null
    var palette = options.palette || null
    var canvas = null,
        ctx = null,
        repeat = 0,
        delay = 250
    var frames = []
    var numRenderedFrames = 0
    var onRenderCompleteCallback = function() {}
    var onRenderProgressCallback = function() {}
    var sampleInterval
    var workers = [],
        availableWorkers = [],
        numWorkers
    var generatingGIF = false

    // We'll try to be a little lenient with the palette so as to make the library easy to use
    // The only thing we can't cope with is having a non-array so we'll bail on that one.
    if (palette) {
        if (!(palette instanceof Array)) {
            throw ('Palette MUST be an array but it is: ', palette)
        } else {
            // Now there are other two constraints that we will warn about
            // and silently fix them... somehow:

            // a) Must contain between 2 and 256 colours
            if (palette.length < 2 || palette.length > 256) {
                console.error('Palette must hold only between 2 and 256 colours')

                while (palette.length < 2) {
                    palette.push(0x000000)
                }

                if (palette.length > 256) {
                    palette = palette.slice(0, 256)
                }
            }

            // b) Must be power of 2
            if (!powerOfTwo(palette.length)) {
                console.error('Palette must have a power of two number of colours')

                while (!powerOfTwo(palette.length)) {
                    palette.splice(palette.length - 1, 1)
                }
            }
        }
    }

    options = options || {}
    sampleInterval = options.sampleInterval || 10
    numWorkers = options.numWorkers || 2

    for (var i = 0; i < numWorkers; i++) {
        var w = new Worker(
            window.URL.createObjectURL(
                new Blob(
                    [
                        '(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module \'"+o+"\'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n\nfunction colorClamp(value) {\n\tif(value < 0) return 0;\n\telse if(value > 255) return 255;\n\n\treturn value;\n}\n\nvar bayerMatrix8x8 = [\n\t[  1, 49, 13, 61,  4, 52, 16, 64 ],\n\t[ 33, 17, 45, 29, 36, 20, 48, 32 ],\n\t[  9, 57,  5, 53, 12, 60,  8, 56 ],\n\t[ 41, 25, 37, 21, 44, 28, 40, 24 ],\n\t[  3, 51, 15, 63,  2, 50, 14, 62 ],\n\t[ 35, 19, 47, 31, 34, 18, 46, 30 ],\n\t[ 11, 59,  7, 55, 10, 58,  6, 54 ],\n\t[ 43, 27, 39, 23, 42, 26, 38, 22 ]\n\t];\n\n\t// int r, int g, int b, int[][] palette, int paletteLength\n\tfunction getClosestPaletteColorIndex(r, g, b, palette, paletteLength) {\n\t\tvar minDistance = 195076;\n\t\tvar diffR, diffG, diffB;\n\t\tvar distanceSquared;\n\t\tvar bestIndex = 0;\n\t\tvar paletteChannels;\n\n\t\tfor(var i = 0; i < paletteLength; i++) {\n\n\t\t\tpaletteChannels = palette[i];\n\t\t\tdiffR = r - paletteChannels[0];\n\t\t\tdiffG = g - paletteChannels[1];\n\t\t\tdiffB = b - paletteChannels[2];\n\n\t\t\tdistanceSquared = diffR*diffR + diffG*diffG + diffB*diffB;\n\n\t\t\tif(distanceSquared < minDistance) {\n\t\t\t\tbestIndex = i;\n\t\t\t\tminDistance = distanceSquared;\n\t\t\t}\n\n\t\t}\n\n\t\treturn bestIndex;\n\t}\n\n// TODO: inPixels -> inComponents or inColors or something more accurate\nfunction BayerDithering(inPixels, width, height, palette) {\n\tvar offset = 0;\n\tvar indexedOffset = 0;\n\tvar r, g, b;\n\tvar pixel, threshold, index;\n\tvar paletteLength = palette.length;\n\tvar matrix = bayerMatrix8x8;\n\tvar indexedPixels = new Uint8Array( width * height );\n\n\tvar modI = 8;\n\tvar modJ = 8;\n\n\tfor(var j = 0; j < height; j++) {\n\t\tvar modj = j % modJ;\n\n\t\tfor(var i = 0; i < width; i++) {\n\n\t\t\tthreshold = matrix[i % modI][modj];\n\n\t\t\tr = colorClamp( inPixels[offset++] + threshold );\n\t\t\tg = colorClamp( inPixels[offset++] + threshold );\n\t\t\tb = colorClamp( inPixels[offset++] + threshold );\n\n\t\t\tindex = getClosestPaletteColorIndex(r, g, b, palette, paletteLength);\n\t\t\tindexedPixels[indexedOffset++] = index;\n\n\t\t}\n\t}\n\n\treturn indexedPixels;\n}\n\n\nfunction ClosestDithering(inPixels, width, height, palette) {\n\n\tvar offset = 0;\n\tvar indexedOffset = 0;\n\tvar r, g, b;\n\tvar index;\n\tvar paletteLength = palette.length;\n\tvar matrix = bayerMatrix8x8;\n\tvar numPixels = width * height;\n\tvar indexedPixels = new Uint8Array( numPixels );\n\n\tfor(var i = 0; i < numPixels; i++) {\n\n\t\tr = inPixels[offset++];\n\t\tg = inPixels[offset++];\n\t\tb = inPixels[offset++];\n\n\t\tindexedPixels[i] = getClosestPaletteColorIndex(r, g, b, palette, paletteLength);\n\n\t}\n\n\treturn indexedPixels;\n\n}\n\n\nfunction FloydSteinberg(inPixels, width, height, palette) {\n\tvar paletteLength = palette.length;\n\tvar offset = 0;\n\tvar indexedOffset = 0;\n\tvar r, g, b;\n\tvar widthLimit = width - 1;\n\tvar heightLimit = height - 1;\n\tvar offsetNextI, offsetNextJ;\n\tvar offsetPrevINextJ;\n\tvar channels, nextChannels;\n\tvar indexedPixels = new Uint8Array( width * height );\n\n\tfor(var j = 0; j < height; j++) {\n\t\tfor(var i = 0; i < width; i++) {\n\n\t\t\tr = colorClamp(inPixels[offset++]);\n\t\t\tg = colorClamp(inPixels[offset++]);\n\t\t\tb = colorClamp(inPixels[offset++]);\n\n\t\t\tvar colorIndex = getClosestPaletteColorIndex(r, g, b, palette, paletteLength);\n\t\t\tvar paletteColor = palette[colorIndex];\n\t\t\tvar closestColor = paletteColor[3];\n\n\t\t\t// We are done with finding the best value for this pixel\n\t\t\tindexedPixels[indexedOffset] = colorIndex;\n\n\t\t\t// Now find difference between assigned value and original color\n\t\t\t// and propagate that error forward\n\t\t\tvar errorR = r - paletteColor[0];\n\t\t\tvar errorG = g - paletteColor[1];\n\t\t\tvar errorB = b - paletteColor[2];\n\n\t\t\tif(i < widthLimit) {\n\n\t\t\t\toffsetNextI = offset + 1;\n\n\t\t\t\tinPixels[offsetNextI++] += (errorR * 7) >> 4;\n\t\t\t\tinPixels[offsetNextI++] += (errorG * 7) >> 4;\n\t\t\t\tinPixels[offsetNextI++] += (errorB * 7) >> 4;\n\n\t\t\t}\n\n\n\t\t\tif(j < heightLimit) {\n\n\t\t\t\tif(i > 0) {\n\n\t\t\t\t\toffsetPrevINextJ = offset - 1 + width;\n\n\t\t\t\t\tinPixels[offsetPrevINextJ++] += (errorR * 3) >> 4;\n\t\t\t\t\tinPixels[offsetPrevINextJ++] += (errorG * 3) >> 4;\n\t\t\t\t\tinPixels[offsetPrevINextJ++] += (errorB * 3) >> 4;\n\n\t\t\t\t}\n\n\t\t\t\toffsetNextJ = offset + width;\n\n\t\t\t\tinPixels[offsetNextJ++] += (errorR * 5) >> 4;\n\t\t\t\tinPixels[offsetNextJ++] += (errorG * 5) >> 4;\n\t\t\t\tinPixels[offsetNextJ++] += (errorB * 5) >> 4;\n\n\n\t\t\t\tif(i < widthLimit) {\n\n\t\t\t\t\tinPixels[offsetNextJ++] += errorR >> 4;\n\t\t\t\t\tinPixels[offsetNextJ++] += errorG >> 4;\n\t\t\t\t\tinPixels[offsetNextJ++] += errorB >> 4;\n\n\t\t\t\t}\n\n\t\t\t}\n\n\t\t\tindexedOffset++;\n\t\t}\n\t}\n\n\treturn indexedPixels;\n}\n\nmodule.exports = {\n\tBayer: BayerDithering,\n\tClosest: ClosestDithering,\n\tFloydSteinberg: FloydSteinberg\n};\n\n\n},{}],2:[function(require,module,exports){\nvar NeuQuant = require(\'./lib/NeuQuant\');\nvar Dithering = require(\'node-dithering\');\n\nfunction channelizePalette( palette ) {\n    var channelizedPalette = [];\n\n    for(var i = 0; i < palette.length; i++) {\n        var color = palette[i];\n\n        var r = (color & 0xFF0000) >> 16;\n        var g = (color & 0x00FF00) >>  8;\n        var b = (color & 0x0000FF);\n\n        channelizedPalette.push([ r, g, b, color ]);\n    }\n\n    return channelizedPalette;\n\n}\n\n\nfunction dataToRGB( data, width, height ) {\n    var i = 0;\n    var length = width * height * 4;\n    var rgb = [];\n\n    while(i < length) {\n        rgb.push( data[i++] );\n        rgb.push( data[i++] );\n        rgb.push( data[i++] );\n        i++; // for the alpha channel which we don\'t care about\n    }\n\n    return rgb;\n}\n\n\nfunction componentizedPaletteToArray(paletteRGB) {\n\n    var paletteArray = [];\n\n    for(var i = 0; i < paletteRGB.length; i += 3) {\n        var r = paletteRGB[ i ];\n        var g = paletteRGB[ i + 1 ];\n        var b = paletteRGB[ i + 2 ];\n        paletteArray.push(r << 16 | g << 8 | b);\n    }\n\n    return paletteArray;\n}\n\n\n// This is the "traditional" Animated_GIF style of going from RGBA to indexed color frames\nfunction processFrameWithQuantizer(imageData, width, height, sampleInterval) {\n\n    var rgbComponents = dataToRGB( imageData, width, height );\n    var nq = new NeuQuant(rgbComponents, rgbComponents.length, sampleInterval);\n    var paletteRGB = nq.process();\n    var paletteArray = new Uint32Array(componentizedPaletteToArray(paletteRGB));\n\n    var numberPixels = width * height;\n    var indexedPixels = new Uint8Array(numberPixels);\n\n    var k = 0;\n    for(var i = 0; i < numberPixels; i++) {\n        r = rgbComponents[k++];\n        g = rgbComponents[k++];\n        b = rgbComponents[k++];\n        indexedPixels[i] = nq.map(r, g, b);\n    }\n\n    return {\n        pixels: indexedPixels,\n        palette: paletteArray\n    };\n\n}\n\n\n// And this is a version that uses dithering against of quantizing\n// It can also use a custom palette if provided, or will build one otherwise\nfunction processFrameWithDithering(imageData, width, height, ditheringType, palette) {\n\n    // Extract component values from data\n    var rgbComponents = dataToRGB( imageData, width, height );\n\n\n    // Build palette if none provided\n    if(palette === null) {\n\n        var nq = new NeuQuant(rgbComponents, rgbComponents.length, 16);\n        var paletteRGB = nq.process();\n        palette = componentizedPaletteToArray(paletteRGB);\n\n    }\n\n    var paletteArray = new Uint32Array( palette );\n    var paletteChannels = channelizePalette( palette );\n\n    // Convert RGB image to indexed image\n    var ditheringFunction;\n\n    if(ditheringType === \'closest\') {\n        ditheringFunction = Dithering.Closest;\n    } else if(ditheringType === \'floyd\') {\n        ditheringFunction = Dithering.FloydSteinberg;\n    } else {\n        ditheringFunction = Dithering.Bayer;\n    }\n\n    pixels = ditheringFunction(rgbComponents, width, height, paletteChannels);\n\n    return ({\n        pixels: pixels,\n        palette: paletteArray\n    });\n\n}\n\n\n// ~~~\n\nfunction run(frame) {\n    var width = frame.width;\n    var height = frame.height;\n    var imageData = frame.data;\n    var dithering = frame.dithering;\n    var palette = frame.palette;\n    var sampleInterval = frame.sampleInterval;\n\n    if(dithering) {\n        return processFrameWithDithering(imageData, width, height, dithering, palette);\n    } else {\n        return processFrameWithQuantizer(imageData, width, height, sampleInterval);\n    }\n\n}\n\n\nself.onmessage = function(ev) {\n    var data = ev.data;\n    var response = run(data);\n    postMessage(response);\n};\n\n},{"./lib/NeuQuant":3,"node-dithering":1}],3:[function(require,module,exports){\n/*\n* NeuQuant Neural-Net Quantization Algorithm\n* ------------------------------------------\n*\n* Copyright (c) 1994 Anthony Dekker\n*\n* NEUQUANT Neural-Net quantization algorithm by Anthony Dekker, 1994. See\n* "Kohonen neural networks for optimal colour quantization" in "Network:\n* Computation in Neural Systems" Vol. 5 (1994) pp 351-367. for a discussion of\n* the algorithm.\n*\n* Any party obtaining a copy of these files from the author, directly or\n* indirectly, is granted, free of charge, a full and unrestricted irrevocable,\n* world-wide, paid up, royalty-free, nonexclusive right and license to deal in\n* this software and documentation files (the "Software"), including without\n* limitation the rights to use, copy, modify, merge, publish, distribute,\n* sublicense, and/or sell copies of the Software, and to permit persons who\n* receive copies from any such party to do so, with the only requirement being\n* that this copyright notice remain intact.\n*/\n\n/*\n* This class handles Neural-Net quantization algorithm\n* @author Kevin Weiner (original Java version - kweiner@fmsware.com)\n* @author Thibault Imbert (AS3 version - bytearray.org)\n* @version 0.1 AS3 implementation\n* @version 0.2 JS->AS3 "translation" by antimatter15\n* @version 0.3 JS clean up + using modern JS idioms by sole - http://soledadpenades.com\n* Also implement fix in color conversion described at http://stackoverflow.com/questions/16371712/neuquant-js-javascript-color-quantization-hidden-bug-in-js-conversion\n*/\n\nmodule.exports = function NeuQuant() {\n\n    var netsize = 256; // number of colours used\n\n    // four primes near 500 - assume no image has a length so large\n    // that it is divisible by all four primes\n    var prime1 = 499;\n    var prime2 = 491;\n    var prime3 = 487;\n    var prime4 = 503;\n\n    // minimum size for input image\n    var minpicturebytes = (3 * prime4);\n\n    // Network Definitions\n\n    var maxnetpos = (netsize - 1);\n    var netbiasshift = 4; // bias for colour values\n    var ncycles = 100; // no. of learning cycles\n\n    // defs for freq and bias\n    var intbiasshift = 16; // bias for fractions\n    var intbias = (1 << intbiasshift);\n    var gammashift = 10; // gamma = 1024\n    var gamma = (1 << gammashift);\n    var betashift = 10;\n    var beta = (intbias >> betashift); // beta = 1/1024\n    var betagamma = (intbias << (gammashift - betashift));\n\n    // defs for decreasing radius factor\n    // For 256 colors, radius starts at 32.0 biased by 6 bits\n    // and decreases by a factor of 1/30 each cycle\n    var initrad = (netsize >> 3);\n    var radiusbiasshift = 6;\n    var radiusbias = (1 << radiusbiasshift);\n    var initradius = (initrad * radiusbias);\n    var radiusdec = 30;\n\n    // defs for decreasing alpha factor\n    // Alpha starts at 1.0 biased by 10 bits\n    var alphabiasshift = 10;\n    var initalpha = (1 << alphabiasshift);\n    var alphadec;\n\n    // radbias and alpharadbias used for radpower calculation\n    var radbiasshift = 8;\n    var radbias = (1 << radbiasshift);\n    var alpharadbshift = (alphabiasshift + radbiasshift);\n    var alpharadbias = (1 << alpharadbshift);\n\n\n    // Input image\n    var thepicture;\n    // Height * Width * 3\n    var lengthcount;\n    // Sampling factor 1..30\n    var samplefac;\n\n    // The network itself\n    var network;\n    var netindex = [];\n\n    // for network lookup - really 256\n    var bias = [];\n\n    // bias and freq arrays for learning\n    var freq = [];\n    var radpower = [];\n\n    function NeuQuantConstructor(thepic, len, sample) {\n\n        var i;\n        var p;\n\n        thepicture = thepic;\n        lengthcount = len;\n        samplefac = sample;\n\n        network = new Array(netsize);\n\n        for (i = 0; i < netsize; i++) {\n            network[i] = new Array(4);\n            p = network[i];\n            p[0] = p[1] = p[2] = ((i << (netbiasshift + 8)) / netsize) | 0;\n            freq[i] = (intbias / netsize) | 0; // 1 / netsize\n            bias[i] = 0;\n        }\n\n    }\n\n    function colorMap() {\n        var map = [];\n        var index = new Array(netsize);\n        for (var i = 0; i < netsize; i++)\n            index[network[i][3]] = i;\n        var k = 0;\n        for (var l = 0; l < netsize; l++) {\n            var j = index[l];\n            map[k++] = (network[j][0]);\n            map[k++] = (network[j][1]);\n            map[k++] = (network[j][2]);\n        }\n        return map;\n    }\n\n    // Insertion sort of network and building of netindex[0..255]\n    // (to do after unbias)\n    function inxbuild() {\n        var i;\n        var j;\n        var smallpos;\n        var smallval;\n        var p;\n        var q;\n        var previouscol;\n        var startpos;\n\n        previouscol = 0;\n        startpos = 0;\n\n        for (i = 0; i < netsize; i++)\n        {\n\n            p = network[i];\n            smallpos = i;\n            smallval = p[1]; // index on g\n            // find smallest in i..netsize-1\n            for (j = i + 1; j < netsize; j++) {\n\n                q = network[j];\n\n                if (q[1] < smallval) { // index on g\n                    smallpos = j;\n                    smallval = q[1]; // index on g\n                }\n            }\n\n            q = network[smallpos];\n\n            // swap p (i) and q (smallpos) entries\n            if (i != smallpos) {\n                j = q[0];\n                q[0] = p[0];\n                p[0] = j;\n                j = q[1];\n                q[1] = p[1];\n                p[1] = j;\n                j = q[2];\n                q[2] = p[2];\n                p[2] = j;\n                j = q[3];\n                q[3] = p[3];\n                p[3] = j;\n            }\n\n            // smallval entry is now in position i\n            if (smallval != previouscol) {\n\n                netindex[previouscol] = (startpos + i) >> 1;\n\n                for (j = previouscol + 1; j < smallval; j++) {\n                    netindex[j] = i;\n                }\n\n                previouscol = smallval;\n                startpos = i;\n\n            }\n\n        }\n\n        netindex[previouscol] = (startpos + maxnetpos) >> 1;\n        for (j = previouscol + 1; j < 256; j++) {\n            netindex[j] = maxnetpos; // really 256\n        }\n\n    }\n\n\n    // Main Learning Loop\n\n    function learn() {\n        var i;\n        var j;\n        var b;\n        var g;\n        var r;\n        var radius;\n        var rad;\n        var alpha;\n        var step;\n        var delta;\n        var samplepixels;\n        var p;\n        var pix;\n        var lim;\n\n        if (lengthcount < minpicturebytes) {\n            samplefac = 1;\n        }\n\n        alphadec = 30 + ((samplefac - 1) / 3);\n        p = thepicture;\n        pix = 0;\n        lim = lengthcount;\n        samplepixels = lengthcount / (3 * samplefac);\n        delta = (samplepixels / ncycles) | 0;\n        alpha = initalpha;\n        radius = initradius;\n\n        rad = radius >> radiusbiasshift;\n        if (rad <= 1) {\n            rad = 0;\n        }\n\n        for (i = 0; i < rad; i++) {\n            radpower[i] = alpha * (((rad * rad - i * i) * radbias) / (rad * rad));\n        }\n\n\n        if (lengthcount < minpicturebytes) {\n            step = 3;\n        } else if ((lengthcount % prime1) !== 0) {\n            step = 3 * prime1;\n        } else {\n\n            if ((lengthcount % prime2) !== 0) {\n                step = 3 * prime2;\n            } else {\n                if ((lengthcount % prime3) !== 0) {\n                    step = 3 * prime3;\n                } else {\n                    step = 3 * prime4;\n                }\n            }\n\n        }\n\n        i = 0;\n\n        while (i < samplepixels) {\n\n            b = (p[pix + 0] & 0xff) << netbiasshift;\n            g = (p[pix + 1] & 0xff) << netbiasshift;\n            r = (p[pix + 2] & 0xff) << netbiasshift;\n            j = contest(b, g, r);\n\n            altersingle(alpha, j, b, g, r);\n\n            if (rad !== 0) {\n                // Alter neighbours\n                alterneigh(rad, j, b, g, r);\n            }\n\n            pix += step;\n\n            if (pix >= lim) {\n                pix -= lengthcount;\n            }\n\n            i++;\n\n            if (delta === 0) {\n                delta = 1;\n            }\n\n            if (i % delta === 0) {\n                alpha -= alpha / alphadec;\n                radius -= radius / radiusdec;\n                rad = radius >> radiusbiasshift;\n\n                if (rad <= 1) {\n                    rad = 0;\n                }\n\n                for (j = 0; j < rad; j++) {\n                    radpower[j] = alpha * (((rad * rad - j * j) * radbias) / (rad * rad));\n                }\n\n            }\n\n        }\n\n    }\n\n    // Search for BGR values 0..255 (after net is unbiased) and return colour index\n    function map(b, g, r) {\n        var i;\n        var j;\n        var dist;\n        var a;\n        var bestd;\n        var p;\n        var best;\n\n        // Biggest possible distance is 256 * 3\n        bestd = 1000;\n        best = -1;\n        i = netindex[g]; // index on g\n        j = i - 1; // start at netindex[g] and work outwards\n\n        while ((i < netsize) || (j >= 0)) {\n\n            if (i < netsize) {\n\n                p = network[i];\n\n                dist = p[1] - g; // inx key\n\n                if (dist >= bestd) {\n                    i = netsize; // stop iter\n                } else {\n\n                    i++;\n\n                    if (dist < 0) {\n                        dist = -dist;\n                    }\n\n                    a = p[0] - b;\n\n                    if (a < 0) {\n                        a = -a;\n                    }\n\n                    dist += a;\n\n                    if (dist < bestd) {\n                        a = p[2] - r;\n\n                        if (a < 0) {\n                            a = -a;\n                        }\n\n                        dist += a;\n\n                        if (dist < bestd) {\n                            bestd = dist;\n                            best = p[3];\n                        }\n                    }\n\n                }\n\n            }\n\n            if (j >= 0) {\n\n                p = network[j];\n\n                dist = g - p[1]; // inx key - reverse dif\n\n                if (dist >= bestd) {\n                    j = -1; // stop iter\n                } else {\n\n                    j--;\n                    if (dist < 0) {\n                        dist = -dist;\n                    }\n                    a = p[0] - b;\n                    if (a < 0) {\n                        a = -a;\n                    }\n                    dist += a;\n\n                    if (dist < bestd) {\n                        a = p[2] - r;\n                        if (a < 0) {\n                            a = -a;\n                        }\n                        dist += a;\n                        if (dist < bestd) {\n                            bestd = dist;\n                            best = p[3];\n                        }\n                    }\n\n                }\n\n            }\n\n        }\n\n        return (best);\n\n    }\n\n    function process() {\n        learn();\n        unbiasnet();\n        inxbuild();\n        return colorMap();\n    }\n\n    // Unbias network to give byte values 0..255 and record position i\n    // to prepare for sort\n    function unbiasnet() {\n        var i;\n        var j;\n\n        for (i = 0; i < netsize; i++) {\n            network[i][0] >>= netbiasshift;\n            network[i][1] >>= netbiasshift;\n            network[i][2] >>= netbiasshift;\n            network[i][3] = i; // record colour no\n        }\n    }\n\n    // Move adjacent neurons by precomputed alpha*(1-((i-j)^2/[r]^2))\n    // in radpower[|i-j|]\n    function alterneigh(rad, i, b, g, r) {\n\n        var j;\n        var k;\n        var lo;\n        var hi;\n        var a;\n        var m;\n\n        var p;\n\n        lo = i - rad;\n        if (lo < -1) {\n            lo = -1;\n        }\n\n        hi = i + rad;\n\n        if (hi > netsize) {\n            hi = netsize;\n        }\n\n        j = i + 1;\n        k = i - 1;\n        m = 1;\n\n        while ((j < hi) || (k > lo)) {\n\n            a = radpower[m++];\n\n            if (j < hi) {\n\n                p = network[j++];\n\n                try {\n\n                    p[0] -= ((a * (p[0] - b)) / alpharadbias) | 0;\n                    p[1] -= ((a * (p[1] - g)) / alpharadbias) | 0;\n                    p[2] -= ((a * (p[2] - r)) / alpharadbias) | 0;\n\n                } catch (e) {}\n\n            }\n\n            if (k > lo) {\n\n                p = network[k--];\n\n                try {\n\n                    p[0] -= ((a * (p[0] - b)) / alpharadbias) | 0;\n                    p[1] -= ((a * (p[1] - g)) / alpharadbias) | 0;\n                    p[2] -= ((a * (p[2] - r)) / alpharadbias) | 0;\n\n                } catch (e) {}\n\n            }\n\n        }\n\n    }\n\n\n    // Move neuron i towards biased (b,g,r) by factor alpha\n    function altersingle(alpha, i, b, g, r) {\n\n        // alter hit neuron\n        var n = network[i];\n        var alphaMult = alpha / initalpha;\n        n[0] -= ((alphaMult * (n[0] - b))) | 0;\n        n[1] -= ((alphaMult * (n[1] - g))) | 0;\n        n[2] -= ((alphaMult * (n[2] - r))) | 0;\n\n    }\n\n    // Search for biased BGR values\n    function contest(b, g, r) {\n\n        // finds closest neuron (min dist) and updates freq\n        // finds best neuron (min dist-bias) and returns position\n        // for frequently chosen neurons, freq[i] is high and bias[i] is negative\n        // bias[i] = gamma*((1/netsize)-freq[i])\n\n        var i;\n        var dist;\n        var a;\n        var biasdist;\n        var betafreq;\n        var bestpos;\n        var bestbiaspos;\n        var bestd;\n        var bestbiasd;\n        var n;\n\n        bestd = ~(1 << 31);\n        bestbiasd = bestd;\n        bestpos = -1;\n        bestbiaspos = bestpos;\n\n        for (i = 0; i < netsize; i++) {\n\n            n = network[i];\n            dist = n[0] - b;\n\n            if (dist < 0) {\n                dist = -dist;\n            }\n\n            a = n[1] - g;\n\n            if (a < 0) {\n                a = -a;\n            }\n\n            dist += a;\n\n            a = n[2] - r;\n\n            if (a < 0) {\n                a = -a;\n            }\n\n            dist += a;\n\n            if (dist < bestd) {\n                bestd = dist;\n                bestpos = i;\n            }\n\n            biasdist = dist - ((bias[i]) >> (intbiasshift - netbiasshift));\n\n            if (biasdist < bestbiasd) {\n                bestbiasd = biasdist;\n                bestbiaspos = i;\n            }\n\n            betafreq = (freq[i] >> betashift);\n            freq[i] -= betafreq;\n            bias[i] += (betafreq << gammashift);\n\n        }\n\n        freq[bestpos] += beta;\n        bias[bestpos] -= betagamma;\n        return (bestbiaspos);\n\n    }\n\n    NeuQuantConstructor.apply(this, arguments);\n\n    var exports = {};\n    exports.map = map;\n    exports.process = process;\n\n    return exports;\n}\n\n},{}]},{},[2])',
                    ],
                    { type: 'text/javascript' }
                )
            )
        )
        console.log('worker:', w)
        workers.push(w)
        availableWorkers.push(w)
    }

    // ---

    // Return a worker for processing a frame
    function getWorker() {
        if (availableWorkers.length === 0) {
            throw new Error('No workers left!')
        }

        return availableWorkers.pop()
    }

    // Restore a worker to the pool
    function freeWorker(worker) {
        availableWorkers.push(worker)
    }

    // Faster/closurized bufferToString function
    // (caching the String.fromCharCode values)
    var bufferToString = (function() {
        var byteMap = []
        for (var i = 0; i < 256; i++) {
            byteMap[i] = String.fromCharCode(i)
        }

        return function(buffer) {
            var numberValues = buffer.length
            var str = ''

            for (var i = 0; i < numberValues; i++) {
                str += byteMap[buffer[i]]
            }

            return str
        }
    })()

    function startRendering(completeCallback) {
        onRenderCompleteCallback = completeCallback

        for (var i = 0; i < numWorkers && i < frames.length; i++) {
            processFrame(i)
        }
    }

    function processFrame(position) {
        var frame
        var worker

        frame = frames[position]

        if (frame.beingProcessed || frame.done) {
            console.error('Frame already being processed or done!', frame.position)
            onFrameFinished()
            return
        }

        frame.sampleInterval = sampleInterval
        frame.beingProcessed = true

        worker = getWorker()

        worker.onmessage = function(ev) {
            var data = ev.data

            // Delete original data, and free memory
            delete frame.data

            // TODO grrr... HACK for object -> Array
            frame.pixels = Array.prototype.slice.call(data.pixels)
            frame.palette = Array.prototype.slice.call(data.palette)
            frame.done = true
            frame.beingProcessed = false

            freeWorker(worker)

            onFrameFinished()
        }

        // TODO transfer objects should be more efficient
        /*var frameData = frame.data;
        //worker.postMessage(frameData, [frameData]);
        worker.postMessage(frameData);*/

        worker.postMessage(frame)
    }

    function processNextFrame() {
        var position = -1

        for (var i = 0; i < frames.length; i++) {
            var frame = frames[i]
            if (!frame.done && !frame.beingProcessed) {
                position = i
                break
            }
        }

        if (position >= 0) {
            processFrame(position)
        }
    }

    function onFrameFinished() {
        // ~~~ taskFinished

        // The GIF is not written until we're done with all the frames
        // because they might not be processed in the same order
        var allDone = frames.every(function(frame) {
            return !frame.beingProcessed && frame.done
        })

        numRenderedFrames++
        onRenderProgressCallback((numRenderedFrames * 0.75) / frames.length)

        if (allDone) {
            if (!generatingGIF) {
                generateGIF(frames, onRenderCompleteCallback)
            }
        } else {
            setTimeout(processNextFrame, 1)
        }
    }

    // Takes the already processed data in frames and feeds it to a new
    // GifWriter instance in order to get the binary GIF file
    function generateGIF(frames, callback) {
        // TODO: Weird: using a simple JS array instead of a typed array,
        // the files are WAY smaller o_o. Patches/explanations welcome!
        var buffer = [] // new Uint8Array(width * height * frames.length * 5);
        var globalPalette
        var gifOptions = { loop: repeat }

        // Using global palette but only if we're also using dithering
        if (dithering !== null && palette !== null) {
            globalPalette = palette
            gifOptions.palette = globalPalette
        }

        var gifWriter = new GifWriter(buffer, width, height, gifOptions)

        generatingGIF = true

        frames.forEach(function(frame, index) {
            var framePalette

            if (!globalPalette) {
                framePalette = frame.palette
            }

            onRenderProgressCallback(0.75 + (0.25 * frame.position * 1.0) / frames.length)
            gifWriter.addFrame(0, 0, width, height, frame.pixels, {
                palette: framePalette,
                delay: delay,
            })
        })

        gifWriter.end()
        onRenderProgressCallback(1.0)

        frames = []
        generatingGIF = false

        callback(buffer)
    }

    function powerOfTwo(value) {
        return value !== 0 && (value & (value - 1)) === 0
    }

    // ---

    this.setSize = function(w, h) {
        width = w
        height = h
        canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        ctx = canvas.getContext('2d')
    }

    // Internally, GIF uses tenths of seconds to store the delay
    this.setDelay = function(seconds) {
        delay = seconds * 0.1
    }

    // From GIF: 0 = loop forever, null = not looping, n > 0 = loop n times and stop
    this.setRepeat = function(r) {
        repeat = r
    }

    this.addFrame = function(element) {
        if (ctx === null) {
            this.setSize(width, height)
        }

        ctx.drawImage(element, 0, 0, width, height)
        var imageData = ctx.getImageData(0, 0, width, height)

        this.addFrameImageData(imageData)
    }

    this.addFrameImageData = function(imageData) {
        var imageDataArray = new Uint8Array(imageData.data)

        frames.push({
            data: imageDataArray,
            width: imageData.width,
            height: imageData.height,
            palette: palette,
            dithering: dithering,
            done: false,
            beingProcessed: false,
            position: frames.length,
        })
    }

    this.onRenderProgress = function(callback) {
        onRenderProgressCallback = callback
    }

    this.isRendering = function() {
        return generatingGIF
    }

    this.getBase64GIF = function(completeCallback) {
        var onRenderComplete = function(buffer) {
            var str = bufferToString(buffer)
            var gif = 'data:image/gif;base64,' + btoa(str)
            completeCallback(gif)
        }

        startRendering(onRenderComplete)
    }

    this.getBlobGIF = function(completeCallback) {
        var onRenderComplete = function(buffer) {
            var array = new Uint8Array(buffer)
            var blob = new Blob([array], { type: 'image/gif' })
            completeCallback(blob)
        }

        startRendering(onRenderComplete)
    }

    // Once this function is called, the object becomes unusable
    // and you'll need to create a new one.
    this.destroy = function() {
        // Explicitly ask web workers to die so they are explicitly GC'ed
        workers.forEach(function(w) {
            w.terminate()
        })
    }
}

// Not using the full blown exporter because this is supposed to be built
// into dist/Animated_GIF.js using a build step with browserify
module.exports = Animated_GIF
