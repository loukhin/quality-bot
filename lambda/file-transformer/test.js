const handler = require('./index')

handler.handler(
  {
    source: {
      kind: 'audio',
      url: 'https://cdn.discordapp.com/attachments/854393579648057374/911668783133896835/RADWIMPS_-_School_Road.mp3'
    },
    target: {
      type: 'ogg'
    }
  },
  {},
  (data, ss) => {
    console.log({ data, ss })
  }
)

/*
{
  "result": {
    "ETag": "\"4e3af8a5909ce8a4258013dc22fa34e7\"",
    "Location": "https://qb-converted-file.s3.amazonaws.com/qb_312644b3-d981-431f-8981-9b974e9bcadc.ogg",
    "key": "qb_312644b3-d981-431f-8981-9b974e9bcadc.ogg",
    "Key": "qb_312644b3-d981-431f-8981-9b974e9bcadc.ogg",
    "Bucket": "qb-converted-file"
  }
}
*/