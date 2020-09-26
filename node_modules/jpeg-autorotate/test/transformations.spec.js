const before = require('mocha').before
const {checkTransformation, transformWithCli} = require('./helpers.js')
const describe = require('mocha').describe
const expect = require('chai').expect
const fs = require('fs-extra')
const it = require('mocha').it
const jo = require('../src/main.js')
const path = require('path')

require('chai').should()

describe('transformations', function() {
  before(function() {
    return fs.emptyDir(path.join(__dirname, '.tmp'))
  })
  const modes = ['promise', 'callback', 'cli']
  modes.forEach((mode) => {
    itShouldTransform(path.join(__dirname, '/samples/image_2.jpg'), 'image_2.jpg', mode)
    itShouldTransform(path.join(__dirname, '/samples/image_3.jpg'), 'image_3.jpg', mode)
    itShouldTransform(path.join(__dirname, '/samples/image_4.jpg'), 'image_4.jpg', mode)
    itShouldTransform(path.join(__dirname, '/samples/image_5.jpg'), 'image_5.jpg', mode)
    itShouldTransform(path.join(__dirname, '/samples/image_6.jpg'), 'image_6.jpg', mode)
    itShouldTransform(path.join(__dirname, '/samples/image_7.jpg'), 'image_7.jpg', mode)
    itShouldTransform(path.join(__dirname, '/samples/image_8.jpg'), 'image_8.jpg', mode)
    itShouldTransform(path.join(__dirname, '/samples/image_exif.jpg'), 'image_exif.jpg', mode)
    if (mode !== 'cli') {
      itShouldTransform(fs.readFileSync(path.join(__dirname, '/samples/image_8.jpg')), 'From a buffer', mode)
    }
  })
})

function itShouldTransform(originPathOrBuffer, label, mode) {
  it('Should rotate image (' + label + ') (' + mode + ')', function(done) {
    this.timeout(20000)
    const options = {quality: 82}
    if (mode === 'promise') {
      testPromise(originPathOrBuffer, options, done)
    }
    if (mode === 'callback') {
      testCallback(originPathOrBuffer, options, done)
    }
    if (mode === 'cli') {
      testCli(originPathOrBuffer, options, done)
    }
  })
}

function testPromise(originPathOrBuffer, options, done) {
  jo.rotate(originPathOrBuffer, options).then(({buffer, orientation, dimensions, quality}) => {
    testTransformation(originPathOrBuffer, buffer, null, orientation, dimensions, quality)
    done()
  })
}

function testCallback(originPathOrBuffer, options, done) {
  jo.rotate(originPathOrBuffer, options, function(error, buffer, orientation, dimensions, quality) {
    testTransformation(originPathOrBuffer, buffer, error, orientation, dimensions, quality)
    done()
  })
}

function testCli(originPathOrBuffer, options, done) {
  transformWithCli(originPathOrBuffer, options.quality).then(({buffer, orientation, dimensions, quality}) => {
    testTransformation(originPathOrBuffer, buffer, null, orientation, dimensions, quality)
    done()
  })
}

function testTransformation(originPathOrBuffer, buffer, error, orientation, dimensions, quality) {
  const data = checkTransformation(originPathOrBuffer, buffer, orientation, dimensions)
  expect(error).to.equal(null)
  expect(quality).to.equal(82)
  expect(data.dimensionsMatch).to.equal(true)
  expect(data.exifMatch).to.equal(true)
  expect(data.pixelsMatch).to.equal(true)
}
