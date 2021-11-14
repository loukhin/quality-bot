const { MessageActionRow, MessageSelectMenu } = require('discord.js')
const { prisma } = require('@/lib/prisma')

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

    if (message.attachments.size) {
      const actionRow = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId('file-type')
          .setPlaceholder('Select file extension!')
          .addOptions([
            {
              label: 'MP3',
              description: 'Convert to MP3 file',
              value: 'mp3'
            },
            {
              label: 'MP4',
              description: 'Convert to MP4 file',
              value: 'mp4'
            },
            {
              label: 'WAV',
              description: 'Convert to WAV file',
              value: 'wav'
            }
          ])
      )
      const sentMessage = await message.reply({
        content: 'Do you want to convert this file?',
        components: [actionRow]
      })
      sentMessage.react('❌')
      // setTimeout(() => {
      //   actionRow.components[0].setDisabled(true)
      //   sentMessage.edit({
      //     content: `This is your file: ${attachment.attachment}`,
      //     components: []
      //   })
      // }, 2000)
    }
  }
}
