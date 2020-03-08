const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('../config/main.json');

export function joinSync(API, member) {
    let server = bot.guilds.get(config.DiscordServerID);
    var users = API;
    var newUser = member; // This is a discord id ie: <012345678901234567>
    // Check if the user's discord ID matches any previous ones from the API.
    users.forEach(user => {
        if(newUser == user)
        {
            // They're synced?? It should give them their roles off the bat. At this point the bot does nothing.
            // Maybe tell them to check out the #public-lounge, #recruitment and #game-roles?
        }else {
            // newUser != user User is not synced on the forums.
            server.channels.get(config.JoinChannelID).send('Welcome <@' + newUser + '> Please register at https://7cav.us/ and sync your discord account with https://7cav.us/account/external-accounts.');
        }
    });
}