require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
    { name: 'dsaa', description: 'Fetches the latest Steam login code within 5 days ago' },
    { name: 'ping', description: 'checks if the bot "DroStAV" is working or not' }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Registering global slash commands...');
        await rest.put(Routes.applicationCommands(process.env.DISCORD_ID), { body: commands });
        console.log('deployCommands.js: ##VERIFIED: Slash commands registered successfully!');
    } catch (error) {
        console.error('deployCommands.js: ##ERROR: Error registering slash commands:', error);
    }
})();

//run "node deployCommands.js" to re-register UI displayed here (Ex. more /commands, description, etc.)