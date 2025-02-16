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

client.on('messageCreate', async (interaction) => {

    if (interaction.content.includes('JadonX24')) {
        const message = interaction.content
        
        //Embed message
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: message,
            encoding_format: "float",
        })

        const relevantMessageId = (await db.one(`SELECT id FROM embeddings ORDER BY embedding <=> '[${response.data[0].embedding.toString()}]' LIMIT 1`)).id
        
        const context = [] 
        const relevantMessage = await interaction.channel.messages.fetch({ limit: 100, before : relevantMessageId });
        context.push(...relevantMessage.values())

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "developer", content: `You are jadonx_. This is a snippet of relevant conversation you have had in the past: ${context.map(msg => `${msg}\n`)}. Based on your past chat history, respond to the user's prompt.` },
                {
                    role: "user",
                    content: message,
                },
            ],
            store: true,
        });

        await interaction.reply(completion.choices[0].message);
    }
});

client.login(TOKEN);