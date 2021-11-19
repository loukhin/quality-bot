const config = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ?? 3000,
  elbUrl: process.env.ELB_URL ?? '',
  databaseUrl: process.env.DATABASE_URL ?? '',
  discordClientId: process.env.DISCORD_CLIENT_ID ?? null,
  discordBotToken: process.env.DISCORD_BOT_TOKEN ?? null,
  youtubeApiKey: process.env.YOUTUBE_API_KEY ?? null,
  slashCommandTestGuildList: process.env.SLASH_COMMAND_TEST_GUILD_LIST?.split(', ') ?? [],
  instanceType: process.env.INSTANCE_TYPE ?? 'text',
  shardId: Number(process.env.SHARD_ID) ?? null,
  shardCount: Number(process.env.SHARD_COUNT) ?? 1
}

module.exports = config
