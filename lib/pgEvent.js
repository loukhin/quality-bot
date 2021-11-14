const createSubscriber = require('pg-listen')
const config = require('@/lib/config')

const subscriber = createSubscriber({ connectionString: config.databaseUrl })

subscriber.events.on('error', error => {
  console.error('Database connection error:', error)
})

const connect = async () => {
  await subscriber.connect()
}

const notify = async (channel, payload) => {
  await subscriber.notify(channel, payload)
}

const on = async (channel, callback) => {
  await subscriber.listenTo(channel)
  subscriber.notifications.on(channel, callback)
}

module.exports = {
  connect,
  notify,
  on
}
