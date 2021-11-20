const ffmpeg = require('fluent-ffmpeg')
const stream = require('stream')
const fs = require('fs')
const got = require('got')

const aws = require('aws-sdk')
const s3 = new aws.S3({ apiVersion: '2006-03-01' })

const audioFileExtensions = ['wav', 'cda', 'mp3', 'wmv', 'aiff', 'mid', 'ogg', 'aac', 'm4a']
const videoFileExtensions = ['avi', 'mp4', 'mov', 'mkv', 'flv', 'webm']

exports.handler = async (event, context, callback) => {
  const { sourceType, sourceUrl, targetType } = event
  const availableExtensions = sourceType === 'audio' ? audioFileExtensions : videoFileExtensions
  try {
    if (!availableExtensions.includes(targetType))
      return callback(new TypeError('target type is invalid!'))
    const pass = new stream.PassThrough()
    await got.stream(event.url).pipe(pass)
    const result = await uploadFileOnS3(pass)
    callback(null, {
      result
    })
  } catch (error) {
    callback(error)
  }
}

const uploadFileOnS3 = async (stream, fileName = 'test') => {
  const params = {
    Bucket: 'qb-file-converter',
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
