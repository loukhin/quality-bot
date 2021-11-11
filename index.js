const path = require('path')
const config = require(path.resolve('lib/config'))

try {
  require(path.resolve(`handlers/${config.instanceType}`))
} catch {
  throw new Error(`Handler for instance type '${config.instanceType}' not found.`)
}
