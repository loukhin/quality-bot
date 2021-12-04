const { Client, Intents, InteractionWebhook } = require('discord.js')
const express = require('express')

const events = require('events')
const event = new events.EventEmitter()

const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice')

const { createYoutubeResource } = require('@/lib/helpers')

const config = require('@/lib/config')
const { prisma } = require('@/lib/prisma')

const pg = require('@/lib/pgEvent')
pg.connect()

const app = express()

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]
})

client.musicQueue = new Map()

app.use(express.json())
app.disable('x-powered-by')
app.post('/api/join', (req, res) => {
  const { voiceChannelId, guildId } = req.body
  event.emit('join', { voiceChannelId, guildId })
  return res.status(200).json()
})

client.login(config.discordBotToken)

app.listen(config.port, () => {
  console.log(`listening on port ${config.port}`)
})

pg.on('stop', async ({ guildId, interactionData }) => {
  const guildQueue = client.musicQueue.get(guildId)
  if (!guildQueue) return

  if (interactionData) {
    try {
      const interaction = new InteractionWebhook(client, interactionData.id, interactionData.token)
      await interaction.editMessage(
        interactionData.messageId,
        'Stopping music player and leaving...'
      )
    } catch (error) {
      console.error(error)
    }
  }

  guildQueue.player.stop()
  guildQueue.player.removeAllListeners()
  guildQueue.connection.destroy()
  guildQueue.connection.removeAllListeners()
  client.musicQueue.delete(guildId)
})

pg.on('pause', async ({ guildId, interactionData }) => {
  const guildQueue = client.musicQueue.get(guildId)
  guildQueue.isPlaying = false
  client.musicQueue.set(guildId, guildQueue)
  guildQueue.player.pause()

  try {
    const interaction = new InteractionWebhook(client, interactionData.id, interactionData.token)
    await interaction.editMessage(interactionData.messageId, 'Pausing music player!')
  } catch (error) {
    console.error(error)
  }
})

pg.on('skip', async ({ guildId, interactionData }) => {
  const guildQueue = client.musicQueue.get(guildId)
  if (!guildQueue) return

  if (interactionData) {
    try {
      const interaction = new InteractionWebhook(client, interactionData.id, interactionData.token)
      await interaction.editMessage(interactionData.messageId, 'Skipping')
    } catch (error) {
      console.error(error)
    }
  }

  guildQueue.songs.shift()
  if (guildQueue.songs.length === 0) {
    pg.notify('stop', { guildId, interactionData })
    return
  }
  const resource = await createYoutubeResource(`https://youtu.be/${guildQueue.songs[0].id}`)
  guildQueue.player.play(resource)

  client.musicQueue.set(guildId, guildQueue)
})

pg.on('queue', async ({ guildId, interactionData }) => {
  const guildQueue = client.musicQueue.get(guildId)
  if (!guildQueue) return
  try {
    const interaction = new InteractionWebhook(client, interactionData.id, interactionData.token)
    const queueMessage = `Now playing ${guildQueue.songs[0].info.title}\n${guildQueue.songs
      .slice(1)
      .map((song, index) => `${index+2}. ${song.info.title}\n`)}`
    await interaction.editMessage(interactionData.messageId, queueMessage)
  } catch (error) {
    console.error(error)
  }
})

pg.on('play', async ({ guildId, interactionData, musicData }) => {
  const guildQueue = client.musicQueue.get(guildId)
  if (!guildQueue) return
  if (musicData) {
    guildQueue.songs.push(musicData)
  }

  if (guildQueue.songs.length === 0 && !musicData) return

  if (guildQueue.isPlaying && guildQueue.player.state.status !== AudioPlayerStatus.Playing) {
    const resource = await createYoutubeResource(`https://youtu.be/${guildQueue.songs[0].id}`)
    guildQueue.player.play(resource)
  } else if (!musicData) {
    guildQueue.player.unpause()
    try {
      const interaction = new InteractionWebhook(client, interactionData.id, interactionData.token)
      await interaction.editMessage(interactionData.messageId, 'Resuming music player!')
    } catch (error) {
      console.error(error)
    }
  }
  client.musicQueue.set(guildId, guildQueue)
})

event.on('join', async ({ guildId, voiceChannelId }) => {
  try {
    if (client.musicQueue.get(guildId)) return

    const guild = await client.guilds.fetch(guildId)
    const connection = joinVoiceChannel({
      channelId: voiceChannelId,
      guildId,
      adapterCreator: guild.voiceAdapterCreator
    })
    const player = createAudioPlayer()
    connection.subscribe(player)
    const queueContruct = {
      player,
      connection,
      songs: [],
      isPlaying: true
    }

    queueContruct.player.on('stateChange', async (oldState, newState) => {
      console.log(`[${guild.name}] Audio player: ${oldState.status} => ${newState.status}`)
      if (newState.status === AudioPlayerStatus.Idle) {
        const guildQueue = client.musicQueue.get(guildId)
        if (guildQueue.songs.length > 0) {
          pg.notify('skip', { guildId })
        }
      }
    })

    queueContruct.connection.on('stateChange', async (oldState, newState) => {
      console.log(`[${guild.name}] Connection: ${oldState.status} => ${newState.status}`)
    })

    client.musicQueue.set(guildId, queueContruct)
  } catch (error) {
    console.error(error)
  }
})

// https://stackoverflow.com/a/14032965
const cleanup = () => {
  console.log('cleaning up...')
  client.musicQueue.forEach(guildQueue => {
    guildQueue.player.stop()
    guildQueue.player.removeAllListeners()
    guildQueue.connection.destroy()
    guildQueue.connection.removeAllListeners()
  })
  process.exit()
}

process.on('exit', cleanup)
