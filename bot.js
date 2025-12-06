require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { authenticate, getLatestEmail } = require('./gmail'); // Fixed function name

console.log("bot.js: ##DroSStAA3 STARTING...");

// Initialize Discord bot
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});


client.once('ready', () => {
    console.log(`bot.js: ✅ Bot is online as ${client.user.tag}`);

    // custom status
    client.user.setPresence({
        /* type: 0 = PLAYING
           type: 1 = STREAMING
           type: 2 = LISTENING
           type: 3 = WATCHING
           type: 4 = CUSTOM
           type: 5 = COMPETING
        */
        activities: [{ name: "use \"/dsaa\" to run!", type: 5 }],
        status: "online" // Options: online, idle, dnd, invisible
    });
});

//uhhhhhh ok???
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'dsaa') {
        await interaction.deferReply(); //prevent timeout

        try {
            const auth = await authenticate();
            const email = await getLatestEmail(auth);
            await interaction.editReply(`✅ Steam Guard Code\n ${email.body}`);
        } catch (error) {
            console.error("bot.js: ##ERROR: Error retrieving emails:",error);
            await interaction.editReply("Error fetching Steam login code. Please try again later.")
        }
    }

    if (commandName === 'ping') {
        await interaction.reply('pork chop.');
    }
});

//actual
client.on('messageCreate', async (message) => {
    console.log(`bot.js: ##Message received: ${message.content}`);

    if (message.author.bot) return; // Ignore bot messages

    if (message.content.startsWith('/dsaa')) { 
        const sentMessage = await message.channel.send(`*Searching for the latest Steam email...*`);

        try {
            const auth = await authenticate();
            const email = await getLatestEmail(auth); // Calls correct function

            if (!email || !email.body || email.body === "Login Code not found.") {  
                await sentMessage.edit(`No recent Steam emails found / Login Code missing.`);
                return;
            }

            //  Fixed issue login code not passed correctly
            await sentMessage.edit(`✅ **Steam Guard Code**\n${email.body}`);

        } catch (error) {
            console.error("bot.js: ##ERROR: Error retrieving emails:", error);
            await sentMessage.edit(`⚠️ Error fetching emails. Check server console for details.`);
        }
    }
});

// Login bot to Discord
client.login(process.env.DISCORD_TOKEN).then(() => {
    console.log("bot.js: #######BOT ONLINE#######");
}).catch(error => {
    console.error("bot.js: ##ERROR: Failed to login:", error);
    process.exit(1); //exits process to autorestart with pm2
});


//makes dummy HTTP server so KOYEB doesn't scream while running web server
const http = require('http');
const PORT = process.env.PORT || 8000;

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running\n');
}).listen(PORT, () => {
    console.log(`Healthcheck server listening on port ${PORT}`);
});

