require('dotenv').config();

const { REST, Routes } = require('discord.js');

const TOKEN = process.env.BOT_TOKEN
const CLIENT_ID = process.env.CLIENT_ID

const commands = [
  {
    name: 'speak',
    description: 'Talk with JadonX24!',
  },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async()=>{
    try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
    console.error(error);
    }
})()