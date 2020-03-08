const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('../config/main.json');

function doSync(API) {
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

function joinSync(API, member) {
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