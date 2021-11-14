const { Client, Collection, Intents } = require('discord.js')
const fs = require('fs')

const config = require('@/lib/config')
const { connect } = require('@/lib/pgEvent')
connect()

const client = new Client({
  shards: config.shardId,
  shardCount: config.shardCount,
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES
  ],
  partials: ['MESSAGE', 'REACTION']
})

const eventFiles = fs.readdirSync('events').filter(file => file.endsWith('.js'))
const commandFiles = fs.readdirSync('commands').filter(file => file.endsWith('.js'))

client.commands = new Collection()
const commands = []

for (const file of eventFiles) {
  const event = require(`@/events/${file}`)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

for (const file of commandFiles) {
  const command = require(`@/commands/${file}`)
  client.commands.set(command.data.name, command)
  commands.push(command.data.toJSON())
}

require('@/lib/registerCommand')(commands)
client.login(config.discordBotToken)
