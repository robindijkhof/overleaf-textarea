const CustomError = require('./customerror.js')
const rotateBuffer = require('./transform.js').rotateBuffer
const fs = require('fs')
const piexif = require('piexifjs')
const promisify = require('util').promisify

const m = {}

m.errors = {
  read_file: 'read_file',
  read_exif: 'read_exif',
  no_orientation: 'no_orientation',
  unknown_orientation: 'unknown_orientation',
  correct_orientation: 'correct_orientation',
  rotate_file: 'rotate_file',
}

/**
 * Read the input, rotate the image, return the result (updated buffer, dimensions, etc)
 */
m.rotate = function(pathOrBuffer, options, callback) {
  const hasCallback = typeof callback === 'function'
  const quality = parseQuality(options.quality)
  const promise = readBuffer(pathOrBuffer)
    .then(readExifFromBuffer)
    .then(({buffer, exifData}) => {
      const orientation = parseOrientationTag({buffer, exifData})
      return Promise.all([
        rotateImage(buffer, orientation, quality),
        rotateThumbnail(buffer, exifData, orientation, quality),
      ]).then(([image, thumbnail]) => {
        return computeFinalBuffer(image, thumbnail, exifData, orientation)
      })
    })
    .then(({updatedBuffer, orientation, updatedDimensions}) => {
      if (!hasCallback) {
        return {buffer: updatedBuffer, orientation, dimensions: updatedDimensions, quality}
      }
      callback(null, updatedBuffer, orientation, updatedDimensions, quality)
    })
    .catch((customError) => {
      const buffer = customError.buffer
      delete customError.buffer
      if (!hasCallback) {
        throw customError
      }
      callback(customError, buffer, null, null, null)
    })
  if (!hasCallback) {
    return promise
  }
}

/**
 * Parse the target JPEG quality
 * (Got from the CLI or the public API)
 */
function parseQuality(rawQuality) {
  const defaultQuality = 100
  if (typeof rawQuality !== 'number') {
    return defaultQuality
  }
  const quality = parseInt(rawQuality)
  return quality > 0 && quality <= 100 ? quality : defaultQuality
}

/**
 * Transform the given input to a buffer
 * (May be a string or a buffer)
 */
function readBuffer(pathOrBuffer) {
  if (typeof pathOrBuffer === 'string') {
    return promisify(fs.readFile)(pathOrBuffer).catch((error) => {
      throw new CustomError(m.errors.read_file, 'Could not read file (' + error.message + ')')
    })
  }
  if (typeof pathOrBuffer === 'object' && Buffer.isBuffer(pathOrBuffer)) {
    return Promise.resolve(pathOrBuffer)
  }
  return Promise.reject(new CustomError(m.errors.read_file, 'Not a file path or buffer'))
}

function readExifFromBuffer(buffer) {
  let exifData = null
  try {
    exifData = piexif.load(buffer.toString('binary'))
  } catch (error) {
    return Promise.reject(new CustomError(m.errors.read_exif, 'Could not read EXIF data (' + error + ')'))
  }
  return Promise.resolve({buffer, exifData})
}

/**
 * Extract the orientation tag from the given EXIF data
 */
function parseOrientationTag({buffer, exifData}) {
  let orientation = null
  if (exifData['0th'] && exifData['0th'][piexif.ImageIFD.Orientation]) {
    orientation = parseInt(exifData['0th'][piexif.ImageIFD.Orientation])
  }
  if (orientation === null) {
    throw new CustomError(m.errors.no_orientation, 'No orientation tag found in EXIF', buffer)
  }
  if (isNaN(orientation) || orientation < 1 || orientation > 8) {
    throw new CustomError(m.errors.unknown_orientation, 'Unknown orientation (' + orientation + ')', buffer)
  }
  if (orientation === 1) {
    throw new CustomError(m.errors.correct_orientation, 'Orientation already correct', buffer)
  }
  return orientation
}

function rotateImage(buffer, orientation, quality) {
  return rotateBuffer(buffer, orientation, quality).catch((error) => {
    throw new CustomError(m.errors.rotate_file, 'Could not rotate image (' + error.message + ')', buffer)
  })
}

function rotateThumbnail(buffer, exifData, orientation, quality) {
  if (typeof exifData['thumbnail'] === 'undefined' || exifData['thumbnail'] === null) {
    return Promise.resolve({})
  }
  return rotateBuffer(Buffer.from(exifData['thumbnail'], 'binary'), orientation, quality).catch((error) => {
    throw new CustomError(m.errors.rotate_file, 'Could not rotate thumbnail (' + error.message + ')', buffer)
  })
}

/**
 * Compute the final buffer by updating the original EXIF data and linking it to the rotated buffer
 */
function computeFinalBuffer(image, thumbnail, exifData, orientation) {
  exifData['0th'][piexif.ImageIFD.Orientation] = 1
  if (typeof exifData['Exif'][piexif.ExifIFD.PixelXDimension] !== 'undefined') {
    exifData['Exif'][piexif.ExifIFD.PixelXDimension] = image.width
  }
  if (typeof exifData['Exif'][piexif.ExifIFD.PixelYDimension] !== 'undefined') {
    exifData['Exif'][piexif.ExifIFD.PixelYDimension] = image.height
  }
  if (thumbnail.buffer) {
    exifData['thumbnail'] = thumbnail.buffer.toString('binary')
  }
  const exifBytes = piexif.dump(exifData)
  const updatedBuffer = Buffer.from(piexif.insert(exifBytes, image.buffer.toString('binary')), 'binary')
  const updatedDimensions = {
    height: image.height,
    width: image.width,
  }
  return Promise.resolve({updatedBuffer, orientation, updatedDimensions})
}

module.exports = m
