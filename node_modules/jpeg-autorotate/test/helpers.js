const exec = require('child_process').exec
const fs = require('fs-extra')
const jpegjs = require('jpeg-js')
const path = require('path')
const piexif = require('piexifjs')
const pixelmatch = require('pixelmatch')
const PNG = require('pngjs').PNG

module.exports = {
  checkTransformation,
  transformWithCli,
}

/**
 * Compare the transformed buffer with the original one,
 * and return the result to the spec file to be tested
 */
function checkTransformation(originPathOrBuffer, transformedBuffer, orientation, dimensions) {
  const origBuffer = typeof originPathOrBuffer === 'string' ? fs.readFileSync(originPathOrBuffer) : originPathOrBuffer
  const origExif = piexif.load(origBuffer.toString('binary'))
  const origJpeg = jpegjs.decode(origBuffer)
  if (typeof originPathOrBuffer === 'string') {
    fs.writeFileSync(originPathOrBuffer.replace('samples/', '.tmp/'), transformedBuffer)
  }
  return {
    dimensionsMatch: compareDimensions(origJpeg, orientation, dimensions),
    exifMatch: compareExif(origExif, piexif.load(transformedBuffer.toString('binary'))),
    pixelsMatch: typeof originPathOrBuffer === 'string' ? comparePixels(originPathOrBuffer, transformedBuffer) : true,
  }
}

/**
 * Compare origin and destination pixels with pixelmatch, and save the diff on disk
 */
function comparePixels(originPathOrBuffer, transformedBuffer) {
  const targetBuffer = fs.readFileSync(originPathOrBuffer.replace('.jpg', '_dest.jpg'))
  const targetJpeg = jpegjs.decode(targetBuffer)
  const diffPng = new PNG({width: targetJpeg.width, height: targetJpeg.height})
  const diffPixels = pixelmatch(
    jpegjs.decode(transformedBuffer).data,
    targetJpeg.data,
    diffPng.data,
    targetJpeg.width,
    targetJpeg.height,
    {
      threshold: 0.25,
    }
  )
  const diffPath = path.join(
    path.join(__dirname, '.tmp'),
    path.parse(originPathOrBuffer).base.replace('.jpg', '.diff.png')
  )
  diffPng.pack().pipe(fs.createWriteStream(diffPath))
  return diffPixels === 0
}

/**
 * Compare origin and destination dimensions
 * Depending on the original orientation, they may be switched
 */
function compareDimensions(origJpeg, orientation, dimensions) {
  if (orientation < 5 && (origJpeg.width !== dimensions.width || origJpeg.height !== dimensions.height)) {
    return false
  }
  if (orientation >= 5 && (origJpeg.width !== dimensions.height || origJpeg.height !== dimensions.width)) {
    return false
  }
  return true
}

/**
 * Compare EXIF arrays
 * The properties allowed to differ between origin and destination images are set to 0
 */
function compareExif(orig, dest) {
  orig['thumbnail'] = 0 // The thumbnail
  dest['thumbnail'] = 0
  orig['0th'][piexif.ImageIFD.Orientation] = 0 // Orientation
  dest['0th'][piexif.ImageIFD.Orientation] = 0
  orig['0th'][piexif.ImageIFD.ExifTag] = 0 // Pointer to the Exif IFD
  dest['0th'][piexif.ImageIFD.ExifTag] = 0
  orig['Exif'][piexif.ExifIFD.PixelXDimension] = 0 // Image width
  dest['Exif'][piexif.ExifIFD.PixelXDimension] = 0
  orig['Exif'][piexif.ExifIFD.PixelYDimension] = 0 // Image height
  dest['Exif'][piexif.ExifIFD.PixelYDimension] = 0
  orig['1st'][piexif.ImageIFD.JPEGInterchangeFormat] = 0 // Offset to the start byte of the thumbnail
  dest['1st'][piexif.ImageIFD.JPEGInterchangeFormat] = 0
  orig['1st'][piexif.ImageIFD.JPEGInterchangeFormatLength] = 0 // Number of bytes of the thumbnail
  dest['1st'][piexif.ImageIFD.JPEGInterchangeFormatLength] = 0
  return JSON.stringify(orig) === JSON.stringify(dest)
}

/**
 * Transform the given path using the CLI module,
 * and return the transformation data by parsing stdout
 */
function transformWithCli(originPath, quality) {
  return new Promise((resolve, reject) => {
    const destPath = originPath.replace('.jpg', '_cli.jpg')
    const command = ['cp ' + originPath + ' ' + destPath, './src/cli.js ' + destPath + ' --quality=' + quality]
    exec(command.join(' && '), function(error, stdout) {
      if (error) {
        return reject(error)
      }
      const output = stdout.match(
        /Processed \(Orientation: ([0-9]{1})\) \(Quality: ([0-9]+)%\) \(Dimensions: ([0-9]+)x([0-9]+)\)/
      )
      fs.readFile(destPath)
        .then((buffer) => {
          return fs.remove(destPath).then(() => {
            resolve({
              buffer,
              orientation: parseInt(output[1]),
              quality: parseInt(output[2]),
              dimensions: {width: parseInt(output[3]), height: parseInt(output[4])},
            })
          })
        })
        .catch(reject)
    })
  })
}
