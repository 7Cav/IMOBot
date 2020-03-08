const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('../config/main.json');

module.exports.run = async (API, members) => {
    var mems = API;
    let discordProfile = members
    console.log(discordProfile);
    
    // Assign Billet Roles:
    mems.forEach(user => {
        // ERROR: discordProfile.forEach is not a function
        discordProfile.forEach(mem => {
            // Sync Ranks
        let shortRank = user.rank_shorthand;
        if(user.status === "active")
        {
            if (Enlisted.includes(shortRank)) {
                if (!mem.Roles.includes('Enlisted')) {
                    mem.addRole('Enlisted');
                    mem.addRole('Active');
                }
            } else if (NCO.includes(shortRank)) {
                if (!mem.Roles.includes('NCO')) {
                    mem.addRole('NCO');
                    mem.addRole('Active');
                }
            } else if (Officer.includes(shortRank)) {
                if (!mem.Roles.includes('Officer')) {
                    mem.addRole('Officer');
                    mem.addRole('Active');
                }
            }
        } else if(user.status === "disch")
        {
            if(user.primary_position === "Retired")
            {
                mem.removeRoles(mem.roles);
                mem.addRole('Retired');
            }else if(user.primary_position === "Discharged")
            {
                mem.removeRoles(discordProfile.roles);
                mem.addRole('Discharged');
            }
            else {
                // Error out.
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