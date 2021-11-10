const { SlashCommandBuilder } = require('@discordjs/builders')
const path = require('path')
const { prisma } = require(path.resolve('lib/prisma'))

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Remind you to do something 🤔')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a new reminder')
        .addStringOption(option =>
          option
            .setName('when')
            .setDescription('When do you want to be reminded? (format: dd/mm/yy)')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('What do you want to be reminded of?')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('edit')
        .setDescription('Edit your reminder')
        .addStringOption(option =>
          option.setName('id').setDescription('Your reminder id').setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('when')
            .setDescription('When do you want to be reminded? (format: dd/mm/yy)')
        )
        .addStringOption(option =>
          option.setName('name').setDescription('What do you want to be reminded of?')
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove your reminder')
        .addStringOption(option =>
          option.setName('id').setDescription('Your reminder id').setRequired(true)
        )
    )
    .addSubcommand(subcommand => subcommand.setName('list').setDescription('View your reminders')),
  async execute(interaction) {
    await interaction.deferReply()
    const guildId = interaction.guildId
    const userId = interaction.user.id
    const subCommand = interaction.options.getSubcommand()

    switch (subCommand) {
      case 'add':
        const name = interaction.options.getString('name')
        const rawRemindAt = interaction.options.getString('when')
        const remindAt = new Date(rawRemindAt)

        if (isNaN(remindAt.getTime())) {
          return await interaction.editReply({
            content: `${rawRemindAt} is not a valid date!`
          })
        }

        await prisma.reminder.create({
          data: {
            name,
            remindAt,
            guildId,
            userId
          }
        })

        await interaction.editReply({
          content: `Your reminder has been created!`
        })
        break
      case 'edit':
        try {
          const id = Number(interaction.options.getString('id'))
          const name = interaction.options.getString('name')

          const rawRemindAt = interaction.options.getString('when')
          const remindAt = new Date(rawRemindAt)

          if (!name && !rawRemindAt) {
            return await interaction.editReply({
              content: `You must provided at least one of these arguments! (\`name\`, \`when\`)`
            })
          }

          if (isNaN(remindAt.getTime())) {
            return await interaction.editReply({
              content: `\`${rawRemindAt}\` is not a valid date!`
            })
          }

          const updateData = Object.assign({}, name && { name }, rawRemindAt && { remindAt })
          await prisma.reminder.update({
            where: {
              id_guildId_userId: {
                id,
                guildId,
                userId
              }
            },
            data: updateData
          })

          await interaction.editReply({
            content: `Your reminder has been updated!`
          })
        } catch (error) {
          console.error(error)
          await interaction.editReply({
            content: `Reminder not found!`
          })
        }
        break
      case 'remove':
        try {
          const id = Number(interaction.options.getString('id'))

          await prisma.reminder.delete({
            where: {
              id_guildId_userId: {
                id,
                guildId,
                userId
              }
            }
          })

          await interaction.editReply({
            content: `#${id} has been deleted!`
          })
        } catch (error) {
          console.error(error)
          await interaction.editReply({
            content: `Reminder not found!`
          })
        }
        break
      case 'list':
        const reminders = await prisma.reminder.findMany({
          where: {
            guildId,
            userId
          },
          orderBy: {
            id: 'asc'
          }
        })
        await interaction.editReply({
          content: reminders.length
            ? reminders
                .map(
                  ({ id, name, remindAt }) =>
                    `#${id}: ${name} - ${new Date(remindAt).toLocaleDateString()}`
                )
                .join('\n')
            : "You don't have any reminder"
        })
        break
    }
  }
}
