const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('../config/main.json');

module.exports.run = async (API) => {
    let server = bot.guilds.get('discordServerID');
    let discordProfile = server.members.get(user.discord_id);
    var users = API;
    // Assign Billet Roles:
    users.forEach(user => {

        // Sync Ranks
        let shortRank = user.rank_shorthand;
        if(user.status === "active")
        {
            if (Enlisted.includes(shortRank)) {
                if (!discordProfile.Roles.includes('Enlisted')) {
                    discordProfile.addRole('Enlisted');
                    discordProfile.addRole('Active');
                }
            } else if (NCO.includes(shortRank)) {
                if (!discordProfile.Roles.includes('NCO')) {
                    discordProfile.addRole('NCO');
                    discordProfile.addRole('Active');
                }
            } else if (Officer.includes(shortRank)) {
                if (!discordProfile.Roles.includes('Officer')) {
                    discordProfile.addRole('Officer');
                    discordProfile.addRole('Active');
                }
            }
        } else if(user.status === "disch")
        {
            if(user.primary_position === "Retired")
            {
                discordProfile.removeRoles(discordProfile.roles);
                discordProfile.addRole('Retired');
            }else if(user.primary_position === "Discharged")
            {
                discordProfile.removeRoles(discordProfile.roles);
                discordProfile.addRole('Discharged');
            }
            else {
                // Error out.
            }
        }
    });

    // Sync Billets
    users.forEach(user => {
        if(user.primary_position in config.ignore)
        {
            // Loop through each Primary then Secondary position and assign the roles
        }
    });
}

module.exports.help = {
    name: 'doSync'
}