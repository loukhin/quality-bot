const path = require('path')
const config = require(path.resolve('lib/config'))

if (config.instanceType === 'text') {
  require(path.resolve('handlers/text.js'))
}
