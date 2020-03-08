/*
    Discord bot for 7th Cav discord.

    Made by Vex
*/

// Dependencies
const Discord = require('discord.js');
var config = require('./config/main.json');
var billet = require('./config/billet.json');
var rank = require('./config/rank.json');
const fs = require("fs");
const bot = new Discord.Client();
const botLogin = config.Login;
var doSync = require('./Methods/doSync');
var joinSync = require('./Methods/joinSync');

var memberList = () => {bot.guilds.get(`${config.DiscordServerID}`).members};
console.log(memberList);

// Crash reporting
bot.on('disconnect', () => console.error('Connection Lost...'));
bot.on('reconnecting', () => console.log('Attempting to reconnect....'));
bot.on('error', error => console.error(error));
bot.on('warn', info => console.error(info));

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
})

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
let userCache = [
    {
        "user_id": 4986,
        "milpac_id": 2808,
        "real_name": "William Vex",
        "username": "Vex.W",
        "uniform_url": "https://7cav.us/data/pixelexit/rosters/uniforms/2/2808.jpg",
        "rank": "Chief Warrant Officer 2",
        "rank_id": 15,
        "rank_image_url": "https://7cav.us/data/pixelexit/rosters/ranks/0/15.jpg",
        "rank_shorthand": "CW2",
        "status": "active",
        "primary_position": "S6 - Developer",
        "secondary_positions": [
            {
                "position_id": 257,
                "position_title": "WAG Administrator",
                "possible_secondary": 1
            },
            {
                "position_id": 590,
                "position_title": "S6 - Game Clerk",
                "possible_secondary": 1
            }
        ],
        "bio": "",
        "join_date": "2018-11-12 00:00:00",
        "promotion_date": "2020-02-23 00:00:00",
        "discord_id": "201893080805146624"
    },
    {
        "user_id": 13,
        "milpac_id": 263,
        "real_name": "Adam Jarvis",
        "username": "Jarvis.A",
        "uniform_url": "https://7cav.us/data/pixelexit/rosters/uniforms/0/263.jpg",
        "rank": "Colonel",
        "rank_id": 6,
        "rank_image_url": "https://7cav.us/data/pixelexit/rosters/ranks/0/6.jpg",
        "rank_shorthand": "COL",
        "status": "active",
        "primary_position": "S6 - Officer In Charge",
        "secondary_positions": [],
        "bio": "",
        "join_date": "2012-05-18 00:00:00",
        "promotion_date": "2019-02-20 00:00:00",
        "discord_id": "104461066662060032"
    }
];

let users = userCache; // in future this would be a db call
// ******* END OF API STUFF *******

// Generalize Shorthand rankings:
var Enlisted = rank.Ranks.Enlisted;
var NCO = rank.Ranks.NCO;
var Officer = rank.Ranks.Officer;

//When the bot is ready.
bot.on('ready', () => {
    console.log("Connected as " + bot.user.tag);

    doSync.run(userCache, memberList);
});

// Message Eventhandler
bot.on("message", msg => {
    // Quick command to make sure the bot works and hasen't crashed.
    if (msg.content.toLowerCase().includes("!bot")) {
        msg.reply("I'm here!");
    };
});

bot.on("guildMemberAdd", member => {
    var id = member.id;
    joinSync.run(userCache, id);
});

//Bot login
bot.login(botLogin).catch(err => console.log(err));