const { SlashCommandBuilder } = require('@discordjs/builders')
const got = require('got')

const config = require('@/lib/config')
const { prisma } = require('@/lib/prisma')
const { search } = require('@/lib/youtube')
const pg = require('@/lib/pgEvent')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ms')
    .setDescription('Music control commands')
    .addSubcommand(subcommand => subcommand.setName('join').setDescription('Join a voice channel'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('play')
        .setDescription('Play a music!')
        .addStringOption(option => option.setName('music').setDescription('Music link or name'))
    )
    .addSubcommand(subcommand => subcommand.setName('pause').setDescription('Pause music player!'))
    .addSubcommand(subcommand => subcommand.setName('stop').setDescription('Stop music player!'))
    .addSubcommand(subcommand => subcommand.setName('skip').setDescription('Skip current track!'))
    .addSubcommand(subcommand => subcommand.setName('queue').setDescription('View song queue')),
  async execute(interaction) {
    const message = await interaction.deferReply({ fetchReply: true })

    const guildId = interaction.guildId

    const channelBinding = await prisma.channelBinding.findUnique({
      where: {
        guildId_bindedCommand: {
          guildId: interaction.guildId,
          bindedCommand: 'MUSIC'
        }
      }
    })

    if (!channelBinding)
      return await interaction.editReply({
        content: 'Please use `/command bind command:Music` to bind this channel for Music player!'
      })
    if (channelBinding.channelId !== interaction.channelId)
      return await interaction.editReply({
        content: `Please use this command in ${interaction.client.channels.cache.get(
          channelBinding.channelId
        )} or re-bind command channel`
      })

    const userVoiceChannel = await interaction.member.voice.channel?.fetch()

    if (!userVoiceChannel) return await interaction.editReply(`You're not in a voice channel!`)

    const botVoiceChannel = interaction.guild.channels.cache.find(
      channel => channel.type === 'GUILD_VOICE' && channel.members.has(interaction.client.user.id)
    )

    if (botVoiceChannel && botVoiceChannel.id !== userVoiceChannel.id)
      return await interaction.editReply(`You're not in my voice channel!`)

    const subCommand = interaction.options.getSubcommand()

    if (subCommand === 'join') {
      if (botVoiceChannel?.id === userVoiceChannel.id)
        return await interaction.editReply(`I'm already in your voice channel`)

      await got.post(`${config.elbUrl}/api/join`, {
        json: {
          type: 'join',
          voiceChannelId: userVoiceChannel.id,
          guildId
        }
      })
      await interaction.editReply(`Joined your voice channel`)
    } else if (subCommand === 'play') {
      if (!botVoiceChannel)
        return await interaction.editReply(
          "I'm not in a voice channel, please use `/ms join` first!"
        )
      const music = interaction.options.getString('music')
      const searchResult = music ? await search(music) : null

      if (searchResult)
        await interaction.editReply(
          `Playing ${searchResult.info.title} => https://youtu.be/${searchResult.id}`
        )

      const payload = Object.assign(
        {
          guildId,
          interactionData: {
            id: interaction.webhook.id,
            token: interaction.token,
            messageId: message.id
          }
        },
        {
          ...(searchResult && { musicData: searchResult })
        }
      )
      await pg.notify(subCommand, payload)
    } else {
      if (!botVoiceChannel)
        return await interaction.editReply(
          "I'm not in a voice channel, please use `/ms join` first!"
        )
      const payload = Object.assign({
        guildId,
        interactionData: {
          id: interaction.webhook.id,
          token: interaction.token,
          messageId: message.id
        }
      })
      await pg.notify(subCommand, payload)
    }
  }
}
