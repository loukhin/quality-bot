const config = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  discordClientId: process.env.DISCORD_CLIENT_ID ?? null,
  discordBotToken: process.env.DISCORD_BOT_TOKEN ?? null,
  slashCommandTestGuildList: process.env.SLASH_COMMAND_TEST_GUILD_LIST.split(', ') ?? [],
  instanceType: process.env.INSTANCE_TYPE ?? 'text',
  shardId: Number(process.env.SHARD_ID) ?? null,
  shardCount: Number(process.env.SHARD_COUNT) ?? 1
}

module.exports = config
