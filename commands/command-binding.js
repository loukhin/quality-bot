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
    .setName('command')
    .setDescription('Configure command binding for this channel')
    .addSubcommand(subcommand =>
      subcommand.setName('unbind').setDescription('Remove command binding from this channel')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('bind')
        .setDescription('Set command binding to this channel')
        .addStringOption(option =>
          option
            .setName('command')
            .setDescription('Command to bound to this channel')
            .setRequired(true)
            .addChoices(commandChoices)
        )
    ),
  async execute(interaction) {
    await interaction.deferReply()

    const guildId = interaction.guildId
    const channelId = interaction.channelId
    const subCommand = interaction.options.getSubcommand()

    if (subCommand === 'bind') {
      const selectedCommand = interaction.options.getString('command')

      const commandName = commandChoices.find(command => command[1] === selectedCommand)[0]

      try {
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
        if (!interaction.replied) {
          await interaction.editReply({
            content: `Successfully bound \`${commandName}\` command to ${interaction.client.channels.cache.get(
              channelId
            )}`
          })
        }
      } catch {
        const channelBinding = await prisma.channelBinding.findUnique({
          where: {
            guildId_bindedCommand: {
              guildId,
              bindedCommand: selectedCommand
            }
          }
        })
        await interaction.editReply({
          content: `Command \`${commandName}\` was already bound to ${interaction.client.channels.cache.get(
            channelBinding.channelId
          )}!`
        })
      }
    } else {
      try {
        await prisma.channelBinding.delete({
          where: {
            guildId_channelId: {
              guildId,
              channelId
            }
          }
        })
        if (!interaction.replied) {
          await interaction.editReply({
            content: `Removed command binding from ${interaction.client.channels.cache.get(
              channelId
            )}`
          })
        }
      } catch {
        if (!interaction.replied) {
          await interaction.editReply({
            content: `This channel isn't bound to any command!`
          })
        }
      }
    }
  }
}
