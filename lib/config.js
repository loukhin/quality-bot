const config = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  discordBotToken: process.env.DISCORD_BOT_TOKEN ?? null,
  instanceType: process.env.INSTANCE_TYPE ?? 'text',
  shardId: Number(process.env.SHARD_ID) ?? null,
  shardCount: Number(process.env.SHARD_COUNT) ?? 1
}

module.exports = config
