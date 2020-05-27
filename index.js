/*
    Discord bot for 7th Cav discord.

    Made by Vex
*/

// Libraries
const Discord = require('discord.js');
const pino = require("pino");
const fs = require("fs");

// Configs
var config = require('./config/main.json');
var billet = require('./config/billet.json');
var ranks = require('./config/ranks.json');

// Bot initialilzation
const bot = new Discord.Client();
const botLogin = config.BotToken;

// Logging
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

// Crash reporting
bot.on('disconnect', () => logger.error('Connection Lost...'));
bot.on('reconnecting', () => logger.info('Attempting to reconnect....'));
bot.on('error', error => logger.error(error));
bot.on('warn', info => logger.error(info));

// Classes
const cavApi = require('./src/CavApi');
const API = new cavApi(config.CavAPIToken, bot);

// Roster
const Roster = {
    RETIRED: 'Retired',
    DISCHARGED: 'Discharged'
};

// Chat Command collection
bot.commands = new Discord.Collection();

// Get all exported chat commands.
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

        // Quick command to make sure the bot is responsive.
        if (msg.content.toLowerCase().startsWith("!imo")) {
            msg.reply("I'm here!");
        }

        // Help command to display all commands for this bot.
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

        // Sync command to sync the user who called it.
        if(msg.content.toLowerCase().startsWith("!sync")) {
            logger.info("Sync running for %s", msg.author.username)
            API.syncDiscordUser(msg.author.id);
            msg.react('✅');
            msg.reply("You're all set");
        }

        // Jarvis's Discord ID.
        var JarvisOnly = '104461066662060032';

        // Jarvis's discord command for syncing all users inside the discord.
        if (msg.content.toLowerCase().startsWith("!jarvis-special-sync") && msg.author.id == JarvisOnly) {
            logger.info("Sync running for ALL users!");
            msg.reply("Oh boy.. here we go..");
            API.runGlobalSync();
        }

        // Milpac command, returns milpac info of user in args else user who called command.
        if(msg.content.toLowerCase().startsWith("!milpac"))
        {
            let discordProfile = msg.mentions.users.first();

            if (!discordProfile) {
                discordProfile = msg.author;
            }

            API.getMilpac(discordProfile).then(milpac => {
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

// Rate limit event handler.
bot.on("rateLimit", info => {
    
    // When the rate limit hits its max per second (2)
    logger.warn("hit rate limt");
    setTimeout(() => true, 500);
})

// User joins discord event.
bot.on("guildMemberAdd", member => {
    var id = member.id;
    //joinSync.run(userCache, id);
    syncDiscordUser(member.id);
});

//Bot login
bot.login(botLogin).catch(err => logger.error(err));

// getMilpac Function
async function getMilpac(discordProfile) {

    apiUserRequest = await API.getUserFromDiscordID(discordProfile.id);

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

/*
    REACT TO ROLES || START
*/

bot.on('raw', event => {
    const eventName = event.t;
    var reactionChannel = bot.channels.get(event.d.channel_id);
    var msgReaction = msg.reactions.get(event.d.emoji.name + ":" + event.d.emoji.id);
    var user = bot.users.get(event.d.user_id);

    if(eventName === 'MESSAGE_REACTION_ADD') {
        if(event.d.message_id === cfg.React.message_id) {
            
            if(reactionChannel.messages.has(event.d.message_id)) {
                return;
            } else {
                reactionChannel.fetchMessage(event.d.message_id)
                .then(msg => {
                    bot.emit('messageReactionAdd', msgReaction, user);
                })
                .catch(err => console.log(err));
            }
        }
    }else if(eventName === 'MESSAGE_REACTION_REMOVE')
    {
        if(event.d.message_id === cfg.React.message_id)
        {
            var reactionChannel = bot.channels.get(event.d.channel_id)
            if(reactionChannel.messages.has(event.d.message_id))
                return;
            else {
                reactionChannel.fetchMessage(event.d.message_id)
                .then(msg => {
                    bot.emit('messageReactionRemove', msgReaction, user);
                })
                .catch(err => console.log(err));
            }
        }
    }
})

// part 2 for the above 'MESSAGE_REACTION_ADD'
bot.on('messageReactionAdd', (messageReaction, user) => {
    var roleName = messageReaction.emoji.name;
    var role = messageReaction.message.guild.roles.find(role => role.name.toLowerCase() === 
    roleName.toLowerCase());

    if(role) {
        var member = messageReaction.message.guild.members.find(member => member.id === user.id);
        if(member)
        {
            member.addRole(role.id);
            console.log("Success! Added role to user") 
            member.send("You've been added to " + role.name)
        }
    }
})

// part 2 for the above 'MESSAGE_REACTION_REMOVE'
bot.on('messageReactionRemove', (messageReaction, user) => {
    var roleName = messageReaction.emoji.name;
    var role = messageReaction.message.guild.roles.find(role => role.name.toLowerCase() === 
    roleName.toLowerCase());

    if(role) {
        var member = messageReaction.message.guild.members.find(member => member.id === user.id);
        if(member)
        {
            member.removeRole(role.id);
            console.log("Success! Removed role from user") 
            member.send("You've been Remvoed from " + role.name)
        }
    }
})

/*
    REACT TO ROLES || END
*/