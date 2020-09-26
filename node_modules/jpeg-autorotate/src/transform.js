const jpegjs = require('jpeg-js')

const m = {}

/**
 * Decode the given buffer and applies the right transformation
 * Depending on the orientation, it may be a rotation and / or an horizontal flip
 */
m.rotateBuffer = function(buffer, orientation, quality) {
  let jpeg = null
  try {
    jpeg = jpegjs.decode(buffer)
  } catch (error) {
    return Promise.reject(error)
  }
  let newBuffer = jpeg.data

  const transformations = {
    2: {rotate: 0, flip: true},
    3: {rotate: 180, flip: false},
    4: {rotate: 180, flip: true},
    5: {rotate: 90, flip: true},
    6: {rotate: 90, flip: false},
    7: {rotate: 270, flip: true},
    8: {rotate: 270, flip: false},
  }

  if (transformations[orientation].rotate > 0) {
    newBuffer = rotatePixels(newBuffer, jpeg.width, jpeg.height, transformations[orientation].rotate)
  }

  const ratioWillChange = (transformations[orientation].rotate / 90) % 2 === 1
  const destWidth = ratioWillChange ? jpeg.height : jpeg.width
  const destHeight = ratioWillChange ? jpeg.width : jpeg.height

  if (transformations[orientation].flip) {
    newBuffer = flipPixels(newBuffer, destWidth, destHeight)
  }

  const newJpeg = jpegjs.encode({data: newBuffer, width: destWidth, height: destHeight}, quality)
  return Promise.resolve({buffer: newJpeg.data, width: destWidth, height: destHeight})
}

/**
 * Rotate a buffer (degrees must be a multiple of 90)
 * Inspired from Jimp (https://github.com/oliver-moran/jimp)
 */
function rotatePixels(buffer, width, height, degrees) {
  let loops = degrees / 90
  while (loops > 0) {
    const newBuffer = Buffer.alloc(buffer.length)
    let newOffset = 0
    for (let x = 0; x < width; x += 1) {
      for (let y = height - 1; y >= 0; y -= 1) {
        const offset = (width * y + x) << 2
        const pixel = buffer.readUInt32BE(offset, true)
        newBuffer.writeUInt32BE(pixel, newOffset, true)
        newOffset += 4
      }
    }
    buffer = newBuffer
    const newHeight = width
    width = height
    height = newHeight
    loops -= 1
  }
  return buffer
}

/**
 * Flip a buffer horizontally
 */
function flipPixels(buffer, width, height) {
  const newBuffer = Buffer.alloc(buffer.length)
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const offset = (width * y + x) << 2
      const newOffset = (width * y + width - 1 - x) << 2
      const pixel = buffer.readUInt32BE(offset, true)
      newBuffer.writeUInt32BE(pixel, newOffset, true)
    }
  }
  return newBuffer
}

module.exports = m
