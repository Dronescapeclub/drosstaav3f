require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { getSteamCode } = require('./gmailProxy');

console.log("bot.js: ##DroSStAA3 STARTING...");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.once('ready', () => {   // ← ONLY CHANGE
    console.log(`bot.js: ✅ Bot is online as ${client.user.tag}`);

    client.user.setPresence({
        activities: [{ name: 'use "/dsaa" to run!', type: 5 }],
        status: "online"
    });
});

// Slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'dsaa') {
        await interaction.deferReply();

        const result = await getSteamCode();

        if (!result.ok) {
            await interaction.editReply("✅ **Steam Guard Code**\nUsername: N/A\nLogin Code: N/A\n*No authorization codes for past 5 days*");
            return;
        }

        await interaction.editReply(
            `✅ **Steam Guard Code**\nUsername: ${result.username}\nLogin Code: ${result.code}`
        );
    }

    if (interaction.commandName === 'ping') {
        await interaction.reply('poing..?');
    }
});

// Text command fallback
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('/dsaa')) {
        const sentMessage = await message.channel.send(`*Searching for the latest Steam email...*`);

        const result = await getSteamCode();

        if (!result.ok) {
            await sentMessage.edit("✅ **Steam Guard Code**\nUsername: N/A\nLogin Code: N/A\n*No authorization codes for past 5 days*");
            return;
        }

        await sentMessage.edit(
            `✅ **Steam Guard Code**\nUsername: ${result.username}\nLogin Code: ${result.code}`
        );
    }
});

client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log("bot.js: #######BOT ONLINE#######"))
    .catch(error => {
        console.error("bot.js: ##ERROR: Failed to login:", error);
        process.exit(1);
    });

// Dummy HTTP server for Koyeb
const http = require('http');
const PORT = process.env.PORT || 8000;

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running\n');
}).listen(PORT, () => {
    console.log(`Healthcheck server listening on port ${PORT}`);
});
////