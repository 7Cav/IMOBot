/*
    Discord bot for 7th Cav discord.

    Made by Vex
*/

// Dependencies
const Discord = require('discord.js');
const pino = require("pino");


var config = require('./config/main.json');
var billet = require('./config/billet.json');
var ranks = require('./config/ranks.json');
const fs = require("fs");
const bot = new Discord.Client();
const botLogin = config.BotToken;

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

// Crash reporting
bot.on('disconnect', () => logger.error('Connection Lost...'));
bot.on('reconnecting', () => logger.info('Attempting to reconnect....'));
bot.on('error', error => logger.error(error));
bot.on('warn', info => logger.error(info));

const Roster = {
    RETIRED: 'Retired',
    DISCHARGED: 'Dischargedf'
};


// Chat Commands:
bot.commands = new Discord.Collection();
fs.readdir('./ChatCmds/', (err, files) => {
    if(err) console.error(err);

    let jsfiles = files.filter(f => f.split(".").pop() === 'js');
    if(jsfiles.length <= 0) return logger.info("No commands!");
    logger.info(`Loading ${jsfiles.length} methods!`);

    jsfiles.forEach((f, i) => {
        let props = require(`./ChatCmds/${f}`);
        logger.info(`${i + 1}: ${f} loaded!`)
        bot.commands.set(props.help.name, props);
    })
})

// ******* START OF API STUFF *******
// Axios and Cav API
const AUTH_TOKEN = config.CavAPIToken;
const axios = require('axios').default;

// active members.
const instance = axios.create({
    baseURL: 'https://api.7cav.us/v1/',
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

async function getActiveUsers() {
    try {
        return await instance.get('users/active');
    } catch (error) {
        logger.error(error);
    }
}

async function getRetUsers() {
    try {
        return await instance.get('users/ret');
    } catch (error) {
        logger.error(error);
    }
}

async function getWohUsers() {
    try {
        return await instance.get('users/woh');
    } catch (error) {
        logger.error(error);
    }
}

async function getResUsers() {
    try {
        return await instance.get('users/reserve');
    } catch (error) {
        logger.error(error);
    }
}

async function getDischUsers() {
    try {
        return await instance.get('users/disch');
    } catch (error) {
        logger.error(error);
    }
}

async function getUserFromDiscordID(discordId) {
    try {
        return await instance.get('user/discord/' + discordId);
    } catch (error) {
        logger.error(error);
    }
}
// ******* END OF API STUFF *******

//When the bot is ready.
bot.on('ready', async () => {
    logger.info("Connected as " + bot.user.tag);
});

// Command prefix:
const prefix = "!";
// Message Eventhandler
bot.on("message", msg => {
    // Don't let the bot deal with bot commands.
    if (msg.author.bot) return;

    // Commands
    if(msg.content.startsWith(prefix))
    {
        // Command Args
        let messageArray = msg.content.toLowerCase().split(/\s+/g);
        let command = messageArray[0]
        let args = messageArray.slice(1);

        // Quick command to make sure the bot works and hasen't crashed.
        if (msg.content.toLowerCase().startsWith("!imo")) {
            msg.reply("I'm here!");
        }

        if(msg.content.toLowerCase().startsWith('!help')) {
            var help = new Discord.MessageEmbed()
                .setColor('#F5CC00')
                .setThumbnail('https://images.7cav.us/7Cav-small.png')
                .setTitle('Commands:')
                .addField('!imo', 'If there is no reponse, the bot crashed.')
                .addField('!help', 'Shows you this message.')
                .addField('!milpac <args>', 'Gives you a detailed embeded response to a user\'s milpac')
                .setTimestamp()
            msg.channel.send(help)
        }

        if(msg.content.toLowerCase().startsWith("!sync")) {
            logger.info("Sync running for %s", msg.author.username)
            syncDiscordUser(msg.author.id);
            msg.react('✅');
            msg.reply("You're all set");
        }

        if (msg.content.toLowerCase().startsWith("!jarvis-special-sync")) {
            logger.info("Sync running for ALL users!");
            msg.reply("Oh boy.. here we go..");
            runGlobalSync();
        }

        if(msg.content.toLowerCase().startsWith("!milpac"))
        {
            let discordProfile = msg.mentions.users.first();

            if (!discordProfile) {
                discordProfile = msg.author;
            }

            getMilpac(discordProfile).then(milpac => {
                if (milpac == null) {
                    msg.reply("No milpac found");
                    return;
                } else {

                    let secondaries = milpac.secondary_positions.map(pos => {
                        return pos.position_title;
                    });

                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor("#ffcc00")
                        .setTitle(`${milpac.rank_shorthand} ${milpac.username}`)
                        .setURL(
                            `https://7cav.us/rosters/profile?uniqueid=${milpac.milpac_id}`
                        )
                        .setAuthor(
                            `${milpac.rank} ${milpac.real_name}`,
                            `${milpac.rank_image_url}`
                        )
                        .setThumbnail("https://images.7cav.us/7Cav-small.png")
                        .addFields(
                            {
                                name: "Primary Position",
                                value: `${milpac.primary_position}`
                            },
                            {
                                name: "Secondary Positions",
                                value: `${
                                    secondaries.length > 0
                                        ? secondaries.join("\r\n")
                                        : "N/A"
                                }`
                            },
                            {
                                name: "Join Date",
                                value: `${milpac.join_date.split(" ")[0]}`
                            }
                        )
                        .setImage(`${milpac.uniform_url}`)
                        .setTimestamp()
                        .setFooter("https://7Cav.us");
                    msg.channel.send(exampleEmbed);
                }
            });
        }
    }
});

bot.on("rateLimit", info => {
    logger.warn("hit rate limt");
    setTimeout(() => true, 500);
})

bot.on("guildMemberAdd", member => {
    var id = member.id;
    //joinSync.run(userCache, id);
    syncDiscordUser(member.id);
});

//Bot login
bot.login(botLogin).catch(err => logger.error(err));

async function getMilpac(discordProfile) {

    apiUserRequest = await getUserFromDiscordID(discordProfile.id);

    // if we couldn't find a cav user for the discord id, return
    if (apiUserRequest.hasOwnProperty("data")) {
        return apiUserRequest.data.data;
    } else {
        logger.info(
            "No user found on the forums for %s",
            discordId
        );
        return null;
    }
}

async function runGlobalSync() {
    // let [active, ret, disch] = await Promise.all([getActiveUsers(), getRetUsers(), getDischUsers()]);

    getActiveUsers().then(res => {
        res.data.data.users
        .filter(user => user.discord_id)
        .forEach(user => {
            syncDiscordUser(user.discord_id, user);
        });
    });

    getRetUsers().then(res => {
        res.data.data.users
            .filter(user => user.discord_id)
            .forEach(user => {
                syncDiscordUser(user.discord_id, user);
            });
    });

    getWohUsers().then(res => {
        res.data.data.users
            .filter(user => user.discord_id)
            .forEach(user => {
                syncDiscordUser(user.discord_id, user);
            });
    });

    getResUsers().then(res => {
        res.data.data.users
            .filter(user => user.discord_id)
            .forEach(user => {
                syncDiscordUser(user.discord_id, user);
            });
    });

    getDischUsers().then(res => {
        res.data.data.users
            .filter(user => user.discord_id)
            .forEach(user => {
                syncDiscordUser(user.discord_id, user);
            });
    });
}

async function syncDiscordUser(discordId, cavUser = null) {

    if (cavUser == null) {
        // attempt to get Cav User via api/user/discord/{id}
        apiUserRequest = await getUserFromDiscordID(discordId);

        // if we couldn't find a cav user for the discord id, return
        if (apiUserRequest.hasOwnProperty('data')) {
            cavUser = apiUserRequest.data.data;
        } else {
            logger.info(
                "No user found on the forums. Skipping %s",
                discordServer.members.cache.get(discordId).username
            );
            return;
        }
    }

    let discordServer = bot.guilds.cache.get(config.DiscordServerID);


    if (!discordServer.members.cache.has(discordId)) {
        // Skipping user, no discord account found
        logger.info("No user found in discord. Skipping %s", cavUser.username);
        return;
    }

    let discordProfile = discordServer.members.cache.get(discordId);

    logger.info(`Starting sync for ${cavUser.username}`);
    await discordProfile.roles.remove(Object.values(config.MANAGED_GROUPS))
        .catch(console.error);

    var rolesToSet = [];

    let rankShortName = cavUser.rank_shorthand;

    if (cavUser.roster_id == 3) {
        await discordProfile.roles.add([config.MANAGED_GROUPS.GROUP_WOH_ID])
            .catch(console.error);
        return;
    }

    if (cavUser.roster_id == 8) {
        await discordProfile.roles.add([config.MANAGED_GROUPS.GROUP_RESERVE_ID])
            .catch(console.error);
        return;
    }

    if (cavUser.status == 'disch') {
        if (cavUser.primary_position == Roster.RETIRED) {
            await discordProfile.roles.add([config.MANAGED_GROUPS.GROUP_RETIRED_ID])
                .catch(console.error);
            return;
        }

        // if the user is discharged, but not retired, we don't care
        // what their billet is. Just give them discarged and move
        // on to the next user
        await discordProfile
            .roles.add([config.MANAGED_GROUPS.GROUP_DISCHARGED_ID])
            .catch(console.error);
        return;
    }

    // all non discharged members need the active role
    rolesToSet.push(config.MANAGED_GROUPS.GROUP_ACTIVE_ID);

    if (ranks.NCO.includes(rankShortName)) {
        rolesToSet.push(config.MANAGED_GROUPS.GROUP_NCO_ID);
    }

    if (ranks.OFFICER.includes(rankShortName)) {
        rolesToSet.push(config.MANAGED_GROUPS.GROUP_OFFICER_ID);
    }

    await discordProfile.roles.add(rolesToSet)
        .catch(console.error);
}
