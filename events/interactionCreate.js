module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isSelectMenu()) {
      console.log(interaction.message.mentions.repliedUser)
    } else if (interaction.isCommand()) {
      const command = interaction.client.commands.get(interaction.commandName)

      if (!command) return

      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(error)
        const reply = {
          content: 'There was an error while executing this command!',
          ephemeral: true
        }
        if (interaction.deferred) {
          await interaction.editReply(reply)
        } else {
          await interaction.reply(reply)
        }
      }
    }
  }
}
