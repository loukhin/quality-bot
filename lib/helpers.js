const ytdl = require('youtube-dl-exec').exec
const AWS = require('aws-sdk')
const { createAudioResource, demuxProbe } = require('@discordjs/voice')

const config = require('@/lib/config')

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

const convertFile = async payload => {
  AWS.config.update({
    accessKeyId: config.awsAccessKey,
    secretAccessKey: config.awsSecretKey,
    region: config.awsRegion
  })
  const params = {
    FunctionName: config.converterFunctionName,
    Payload: JSON.stringify(payload)
  }
  return new AWS.Lambda().invoke(params).promise()
}

module.exports = {
  createYoutubeResource,
  convertFile
}
