module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    if (reaction.partial) {
      try {
        await reaction.fetch()
      } catch (error) {
        console.error('Something went wrong when fetching the message:', error)
        return
      }
    }
    const isNotSelfMessage = reaction.message.author.id !== reaction.client.user.id
    const isSelfReaction = user.id === reaction.client.user.id
    const isReplying = reaction.message.mentions.repliedUser !== null
    const isNotRepliedUserReaction = user.id === reaction.message.mentions.repliedUser
    if (isNotSelfMessage || isSelfReaction || isNotRepliedUserReaction || !reaction.me) return

    const isDeleteEmoji = reaction.emoji.name === '❌'

    if (isDeleteEmoji) {
      if (isReplying) {
        const channel = await reaction.client.channels.fetch(reaction.message.channelId)
        const userFile = await channel.messages.fetch(reaction.message.reference.messageId)
        userFile.delete()
      }
      reaction.message.delete()
    }
  }
}
