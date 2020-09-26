const m = function(code, message, buffer = null) {
  this.code = code
  this.message = message
  this.buffer = buffer
  this.stack = new Error().stack
}
m.prototype = Object.create(Error.prototype)
m.prototype.constructor = m

module.exports = m
