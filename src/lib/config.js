const config = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  discordBotToken: process.env.DISCORD_BOT_TOKEN ?? '',
  instanceType: process.env.INSTANCE_TYPE ?? 'text'
}

export default config
