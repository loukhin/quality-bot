const ffmpeg = require('fluent-ffmpeg')
const stream = require('stream')
const fs = require('fs')
const got = require('got')
const uuid = require('uuid')

const aws = require('aws-sdk')
const s3 = new aws.S3({ apiVersion: '2006-03-01' })

const audioFileExtensions = ['wav', 'cda', 'mp3', 'wmv', 'aiff', 'mid', 'ogg', 'aac', 'm4a']
const videoFileExtensions = ['avi', 'mp4', 'mov', 'mkv', 'flv', 'webm']

exports.handler = async (event, context, callback) => {
  const { source, target } = event
  const availableExtensions = source.kind === 'audio' ? audioFileExtensions : videoFileExtensions
  try {
    if (!availableExtensions.includes(target.type))
      return callback(new TypeError('target type is invalid!'))
    const sourceFile = new stream.PassThrough()
    await got.stream(source.url).pipe(sourceFile)
    const fileName = `qb_${uuid.v4()}.${target.type}`
    const convertedFile = await convertFile(sourceFile, fileName)
    const convertedStream = fs.createReadStream(convertedFile)
    const result = await uploadFileOnS3(convertedStream, fileName)
    callback(null, {
      result
    })
  } catch (error) {
    callback(error)
  }
}

const convertFile = async (input, output) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(input)
      .output(`/tmp/${output}`)
      .on('progress', progress => console.log(progress))
      .on('error', err => reject(err))
      .on('end', () => resolve(`/tmp/${output}`))
      .run()
  })
}

const uploadFileOnS3 = async (stream, fileName) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    Body: stream
  }

  try {
    const response = await s3.upload(params).promise()
    console.log('Response: ', response)
    return response
  } catch (err) {
    console.log(err)
  }
}
