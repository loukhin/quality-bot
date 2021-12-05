const { MessageActionRow, MessageSelectMenu } = require('discord.js')
const { prisma } = require('@/lib/prisma')

const audioFileExtensions = ['wav', 'cda', 'mp3', 'wmv', 'aiff', 'mid', 'ogg', 'aac', 'm4a']
const videoFileExtensions = ['avi', 'mp4', 'mov', 'mkv', 'flv', 'webm']
const availableContentType = ['audio', 'video']

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.id === message.client.user.id) return

    const channelBinding = await prisma.channelBinding.findUnique({
      where: {
        guildId_channelId: {
          guildId: message.guildId,
          channelId: message.channelId
        }
      }
    })

    if (channelBinding?.bindedCommand !== 'FILECONVERTER') return
    if (message.attachments?.size !== 1) {
      const sentMessage = await message.reply({
        content: `Please upload one file at a time!`
      })
      sentMessage.react('❌')
      return
    }

    const attachment = message.attachments.values().next().value

    const attachmentContentType = attachment.contentType?.split('/')[0]
    if (availableContentType.includes(attachmentContentType)) {
      const availableFileExtensions =
        attachmentContentType === 'audio' ? audioFileExtensions : videoFileExtensions
      const actionRow = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId('file-type')
          .setPlaceholder('Select file extension!')
          .addOptions(
            availableFileExtensions.map(extension => ({
              label: extension.toUpperCase(),
              description: `Convert to ${extension.toUpperCase()} file`,
              value: extension
            }))
          )
      )
      const sentMessage = await message.reply({
        content: 'Do you want to convert this file?',
        components: [actionRow]
      })
      sentMessage.react('❌')
    } else {
      const sentMessage = await message.reply({
        content: `This file is not supported! (Support only ${availableContentType.join(
          ', '
        )} file)`
      })
      sentMessage.react('❌')
    }
  }
}
