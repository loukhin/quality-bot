const { Client, Collection, Intents } = require('discord.js')
const fs = require('fs')
const path = require('path')

const config = require(path.resolve('lib/config'))

const client = new Client({
  shards: config.shardId,
  shardCount: config.shardCount,
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ],
	partials: ['MESSAGE', 'REACTION'],
})

const eventFiles = fs.readdirSync(path.resolve('events')).filter(file => file.endsWith('.js'))
const commandFiles = fs.readdirSync(path.resolve('commands')).filter(file => file.endsWith('.js'))

client.commands = new Collection()
const commands = []

for (const file of eventFiles) {
  const event = require(path.resolve(`events/${file}`))
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

for (const file of commandFiles) {
  const command = require(path.resolve(`commands/${file}`))
  client.commands.set(command.data.name, command)
  commands.push(command.data.toJSON())
}

require(path.resolve('lib/registerCommand'))(commands)
client.login(config.discordBotToken)
