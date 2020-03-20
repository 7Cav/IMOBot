/*
    Discord bot for 7th Cav discord.

    Made by Vex
*/

// Dependencies
const Discord = require('discord.js');
var config = require('./config/main.json');
var billet = require('./config/billet.json');
var ranks = require('./config/ranks.json');
const fs = require("fs");
const bot = new Discord.Client();
const botLogin = config.BotToken;
//var doSync = require('./Methods/doSync');  // This is depricated atm
//var joinSync = require('./Methods/joinSync');  // This is depricated atm

// Prevent the bot from pausing due to the amount of listeners being emitted
// when the function at line 141 runs.
// require('events').EventEmitter.prototype._maxListeners = 0;

// Crash reporting
bot.on('disconnect', () => console.error('Connection Lost...'));
bot.on('reconnecting', () => console.log('Attempting to reconnect....'));
bot.on('error', error => console.error(error));
bot.on('warn', info => console.error(info));

const Roster = {
    RETIRED: 'Retired',
    DISCHARGED: 'Dischargedf'
};


// Chat Commands:
bot.commands = new Discord.Collection();
fs.readdir('./ChatCmds/', (err, files) => {
    if(err) console.error(err);

    let jsfiles = files.filter(f => f.split(".").pop() === 'js');
    if(jsfiles.length <= 0) return console.log('No commands!');
    console.log(`Loading ${jsfiles.length} methods!`);

    jsfiles.forEach((f, i) => {
        let props = require(`./ChatCmds/${f}`);
        console.log(`${i + 1}: ${f} loaded!`)
        bot.commands.set(props.help.name, props);
    })
})

// ******* START OF API STUFF *******
// Axios and Cav API
const AUTH_TOKEN = config.CavAPIToken;
const axios = require('axios').default;

// active members.
const instance = axios.create({
    baseURL: 'https://api.7cav.us/v1/users/active',
    withCredentials: false,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + AUTH_TOKEN
    }
});

// This is to append to the API call.
// instance += axios.create({
//     baseURL: 'https://api.7cav.us/v1/users/ret',
//     withCredentials: false,
//     headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': "Bearer " + AUTH_TOKEN
//     }
// })

// Concept API call to get updated information from API.
// Return information from the API and put it into ./data.json

// Simulated API response:
let users = require('./mock-db.json').data.users;
// ******* END OF API STUFF *******

//When the bot is ready.
bot.on('ready', () => {
    console.log("Connected as " + bot.user.tag);

    users.forEach(user => {
        syncDiscordUser(user.discord_id, user);
    });

});

// Message Eventhandler
bot.on("message", msg => {
    // Quick command to make sure the bot works and hasen't crashed.
    if (msg.content.toLowerCase().includes("!bot")) {
        msg.reply("I'm here!");
    }

    if(msg.content.toLowerCase().includes("!sync")) {
        syncDiscordUser(msg.author.id);
    }

    if(msg.content.toLowerCase().includes("!milpac"))
    {

    }
});

bot.on("guildMemberAdd", member => {
    var id = member.id;
    //joinSync.run(userCache, id);
    syncDiscordUser(member.id);
});

//Bot login
bot.login(botLogin).catch(err => console.log(err));


async function syncDiscordUser(discordId, cavUser = null) {

    var apiUserObject = {};
    if (cavUser == null) {
        // attempt to get Cav User via api/user/discord/{id}
        // apiUserRequest = await goGetApiUserObject(discordId);

        // if we couldn't find a cav user for the discord id, return
        if (Object.keys(apiUserObject).length === 0
        && apiUserObject.constructor === Object) {
            console.log("no cav user found");
            return;
        } else {
            cavUser = apiUserObject.user;
        }
    }

    let discordServer = bot.guilds.get(config.DiscordServerID);
    let discordProfile = discordServer.members.get(discordId);

    await discordProfile.removeRoles(Object.values(config.MANAGED_GROUPS))
        .catch(console.log);

    let rankShortName = cavUser.rank_shorthand;

    if (cavUser.status == 'disch') {
        if (cavUser.primary_position == Roster.RETIRED) {
            discordProfile.addRole(config.MANAGED_GROUPS.GROUP_RETIRED_ID)
                .catch(console.log);
            return;
        }

        // if the user is discharged, but not retired, we don't care
        // what their billet is. Just give them discarged and move
        // on to the next user
        discordProfile.addRole(config.MANAGED_GROUPS.GROUP_DISCHARGED_ID)
        .catch(console.log);
        return;
    }

    // all non discharged members need the active role
    discordProfile.addRole(config.MANAGED_GROUPS.GROUP_ACTIVE_ID)
        .catch(console.log);

    if (ranks.NCO.includes(rankShortName)) {
        discordProfile.addRole(config.MANAGED_GROUPS.GROUP_NCO_ID)
            .catch(console.log);
        return;
    }

    if (ranks.OFFICER.includes(rankShortName)) {
        discordProfile.addRole(config.MANAGED_GROUPS.GROUP_OFFICER_ID)
            .catch(console.log);
        return;
    }
}
