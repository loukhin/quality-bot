const ytdl = require('youtube-dl-exec').exec
const { createAudioResource, demuxProbe } = require('@discordjs/voice')
const createYoutubeResource = youtubeUrl => {
  return new Promise((resolve, reject) => {
    const process = ytdl(
      youtubeUrl,
      {
        o: '-',
        q: '',
        f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
        r: '100K'
      },
      { stdio: ['ignore', 'pipe', 'ignore'] }
    )
    if (!process.stdout) {
      reject(new Error('No stdout'))
      return
    }
    const stream = process.stdout
    const onError = error => {
      if (!process.killed) process.kill()
      stream.resume()
      reject(error)
    }
    process
      .once('spawn', () => {
        demuxProbe(stream)
          .then(probe => {
            const resource = createAudioResource(probe.stream, {
              inputType: probe.type,
              inlineVolume: true
            })
            resource.volume.setVolume(0.1)

            resolve(resource)
          })
          .catch(onError)
      })
      .catch(onError)
  })
}

module.exports = {
  createYoutubeResource
}
