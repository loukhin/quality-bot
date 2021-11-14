require('module-alias/register')

const config = require('@/lib/config')

try {
  require(`@/handlers/${config.instanceType}`)
} catch (error) {
  console.log(error)
  if (error.code === 'MODULE_NOT_FOUND')
    throw new Error(`Handler for instance type '${config.instanceType}' not found.`)

  throw error
}
