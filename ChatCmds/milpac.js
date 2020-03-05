const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('../config/main.json');

module.exports.run = async (API, userID) => {
    var users = API;
    users.forEach(user => {
        if(user.discord_id == userID)
        {
            var uniqueID = user.milpac_id;
            // Reply with Milpac Link
            bot.reply(`https://7cav.us/rosters/profile?uniqueid=${uniqueID}`);
        }
    });
}

module.exports.help = {
    name: 'milpac'
}