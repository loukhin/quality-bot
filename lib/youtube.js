const got = require('got')

const config = require('@/lib/config')

const search = async query => {
  const { items } = await got
    .get('https://www.googleapis.com/youtube/v3/search', {
      searchParams: {
        key: config.youtubeApiKey,
        order: 'relevance',
        part: 'snippet',
        type: 'video',
        maxResults: 1,
        q: query
      }
    })
    .json()
  const {
    id: { videoId },
    snippet
  } = items[0]
  return { id: videoId, info: snippet }
}

const makeMetadata = async id => {
  console.log({id})
  const metadata = await got
    .get(`https://youtube.com/oembed`, {
      searchParams: {
        url: `https://youtu.be/${id}`,
        format: 'json'
      }
    })
    .json()
  return { id, info: { ...metadata } }
}

module.exports = { search, makeMetadata }
