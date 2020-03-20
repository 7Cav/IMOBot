const Discord = require('discord.js');
module.exports.run = async(bot, msg, args, getUserFromDiscordID) => {
    if (args[0]) {
		const user = getUserFromMention(args[0]);
		if (!user) {
			user = msg.author.id;
        }
        
        let cavMem = await getUserFromDiscordID(user);
        console.log(cavMem);

        let id = cavMem.milpac_id;

        return message.channel.send(`https://7cav.us/rosters/profile?uniqueid=${id}`);
        user.id
    }

            function getUserFromMention(mention) {
                if (!mention) return;
            
                if (mention.startsWith('<@') && mention.endsWith('>')) {
                    mention = mention.slice(2, -1);
            
                    if (mention.startsWith('!')) {
                        mention = mention.slice(1);
                    }
            
                    return bot.guilds.get('279151383133814785').members.get(mention);
                }
            }
            
}

module.exports.help = {
    name: 'milpac'
}