module.exports = {
  name: 'shardReady',
  execute(id) {
    console.log(`Shard #${id} is now ready!`)
  }
}
