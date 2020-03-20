const Discord = require('discord.js');
module.exports.run = async(bot, msg, args, getUserFromDiscordID) => {
            msg.reply('I am online!')
            .catch(error => console.log(`Error: ${error}`));
}

module.exports.help = {
    name: 'bot'
}