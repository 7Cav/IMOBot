const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('../config/main.json');

module.exports.run = async (API, members) => {
    var users = API;
    let discordProfile = members

    // Assign Billet Roles:
    users.forEach(user => {
            // ERROR: discordProfile.forEach is not a function
        discordProfile.forEach(mem => {
                // Sync Ranks
            let shortRank = user.rank_shorthand;
            if(user.status === "active")
            {
                if (Enlisted.includes(shortRank)) {
                    if (!user.Roles.includes('Enlisted')) {
                        user.addRole('Enlisted');
                        user.addRole('Active');
                    }
                } else if (NCO.includes(shortRank)) {
                    if (!user.Roles.includes('NCO')) {
                        user.addRole('NCO');
                        user.addRole('Active');
                    }
                } else if (Officer.includes(shortRank)) {
                    if (!user.Roles.includes('Officer')) {
                        user.addRole('Officer');
                        user.addRole('Active');
                    }
                }
            } else if(user.status === "disch")
            {
                if(user.primary_position === "Retired")
                {
                    user.removeRoles(mem.roles);
                    user.addRole('Retired');
                }else if(user.primary_position === "Discharged")
                {
                    user.removeRoles(discordProfile.roles);
                    user.addRole('Discharged');
                }
            }
        })
    })

    // Sync Billets
    mems.forEach(user => {
        if(user.primary_position in config.ignore)
        {
            // Loop through each Primary then Secondary position and assign the roles
        }
    });
}

module.exports.help = {
    name: 'doSync'
}
