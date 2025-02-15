require('dotenv').config();

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

async function embedConversation(text, id){
    //Embed 
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    })
    //Store in database
    await db.none(`INSERT INTO embeddings VALUES ('${id}', '[${response.data[0].embedding.toString()}]')`)
}

const { Client, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
] });

const TOKEN = process.env.BOT_TOKEN

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

//Get conversation history, break into chunks
client.on('messageCreate', async (interaction) => {
    if (interaction.content === 'history') {
        let allMessages = [];
        let lastMessageId = null;
            
        // Fetch messages in batches of 100
        while(true) {
            const options = { limit: 100 };
            if (lastMessageId) {
                options.before = lastMessageId;
            }

            const messages = await interaction.channel.messages.fetch(options);
            if (messages.size === 0) break;

            allMessages.push(...messages.values());
            lastMessageId = messages.last().id;

            const printable = []
            printable.push(...messages.values());
            printable.reverse().forEach((msg) => {
              console.log(`${msg.author.tag}: ${msg.content}`);
            });
        }

        // Log all messages
        // allMessages.reverse().forEach((msg) => {
        //     console.log(`${msg.author.tag}: ${msg.content}`);
        // });

        interaction.channel.send(`Fetched ${allMessages.length} messages. Check the console for details.`);
    }
});
    
client.login(TOKEN);