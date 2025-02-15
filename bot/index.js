require('dotenv').config();

const { Client, Events, GatewayIntentBits } = require('discord.js');

const pgp = require('pg-promise')()
const db = pgp({
  host: process.env.DB_HOST,        
  port: 5432,               
  database: 'conversation_db',         
  user: 'postgres',           
  password: process.env.DB_PASSWORD,   
  //ssl: { rejectUnauthorized: false }
})

const OpenAI = require('openai')
const openai = new OpenAI()

const TOKEN = process.env.BOT_TOKEN

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] });

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'speak') {

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "developer", content: "You are a helpful assistant." },
            {
                role: "user",
                content: interaction.content,
            },
        ],
        store: true,
    });

    await interaction.reply(completion.choices[0].message);
  }
});

client.login(TOKEN);