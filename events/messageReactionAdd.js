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
    const reactedUser = await reaction.users.fetch()
    const isNotSelfMessage = reaction.message.author.id !== reaction.client.user.id
    const isSelfReaction = user.id === reaction.client.user.id
    const isNotDeletable = !reactedUser.has(reaction.client.user.id)
    const isReplying = reaction.message.mentions.repliedUser !== null
    const isNotMentionedUserReaction = !reaction.message.mentions.users.has(user.id)
    const isNotDeleteEmoji = reaction.emoji.name !== '❌'

    if (
      isNotDeleteEmoji ||
      isNotSelfMessage ||
      isSelfReaction ||
      isNotDeletable ||
      isNotMentionedUserReaction
    )
      return

    if (isReplying) {
      try {
        const channel = await reaction.client.channels.fetch(reaction.message.channelId)
        const userFile = await channel.messages.fetch(reaction.message.reference.messageId)
        userFile.delete()
      } catch {}
    }
    reaction.message.delete()
  }
}
