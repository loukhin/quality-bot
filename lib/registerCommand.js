const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

const path = require('path')
const config = require(path.resolve('lib/config'))

const rest = new REST({ version: '9' }).setToken(config.discordBotToken)

const clientId = '906764291477209218'
const guildId = '713658288855842816'

module.exports = async (commands) => {
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}
