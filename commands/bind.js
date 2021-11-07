const { SlashCommandBuilder } = require('@discordjs/builders')
const path = require('path')
const { prisma } = require(path.resolve('lib/prisma'))

const commandChoices = [
  ['Reminder', 'REMINDER'],
  ['Music', 'MUSIC'],
  ['File Converter', 'FILECONVERTER']
]

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bind')
    .setDescription('Bind command to current text channel')
    .addStringOption(option =>
      option
        .setName('command')
        .setDescription('Command to bound to this channel')
        .setRequired(true)
        .addChoices(commandChoices)
    ),
  async execute(interaction) {
    await interaction.deferReply()

    const guildId = interaction.guildId
    const channelId = interaction.channelId
    const selectedCommand = interaction.options.getString('command')

    await prisma.channelBinding.upsert({
      where: {
        guildId_channelId: {
          guildId,
          channelId
        }
      },
      create: {
        guildId,
        channelId,
        bindedCommand: selectedCommand
      },
      update: {
        bindedCommand: selectedCommand
      }
    })
    const commandName = commandChoices.find(command => command[1] === selectedCommand)[0]
    if (!interaction.replied) {
      await interaction.editReply({
        content: `Successfully bound ${commandName} command to ${interaction.client.channels.cache.get(
          channelId
        )}`
      })
      setTimeout(() => {
        interaction.deleteReply()
      }, 5000)
    }
  }
}
