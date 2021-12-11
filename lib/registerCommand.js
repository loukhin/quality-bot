const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

const config = require('@/lib/config')

const rest = new REST({ version: '9' }).setToken(config.discordBotToken)

module.exports = async commands => {
  try {
    console.log('Started refreshing application (/) commands.')

    if (config.NODE_ENV === 'development') {
      for (const guildId of config.slashCommandTestGuildList) {
        await rest.put(Routes.applicationGuildCommands(config.discordClientId, guildId), {
          body: commands
        })
      }
    } else {
      await rest.put(Routes.applicationCommands(config.discordClientId), {
        body: commands
      })
    }

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}
