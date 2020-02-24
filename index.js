/*
    Discord bot for 7th Cav discord.

    Made by Vex
*/

// Dependencies
const Discord = require('discord.js');
const config = require('./config.json');
const fs = require("fs");
let data = require('./data.json');
const bot = new Discord.Client();
const botLogin = config.Login;

// ******* START OF API STUFF *******
// Axios and Cav API
const AUTH_TOKEN = config.CavAPIToken;
const axios = require('axios').default;
const instance = axios.create({
    baseURL: 'https://api.7cav.us/v1/users/active',
    withCredentials: false,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + AUTH_TOKEN
    }
})

// Concept API call to get updated information from API.
// Return information from the API and put it into ./data.json
function getAPI() {
    // GET: /users/active
    instance({
        method: "GET",
        url: "https://api.7cav.us/v1/users/active",
        responseType: "stream"
    }).then(function (response) {
        response.data.pipe(fs.createWriteStream(JSON.stringify()));
    })
}

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
var Enlisted = ["RCT", "PVT", "PFC", "SPC"];
var NCO = ["CPL", "SGT", "SSG", "SFC", "MSG", "1SG", "SGM", "CSM", "WO1", "CW2", "CW3", "CW4", "CW5"];
var Officer = ["2LT", "1LT", "CPT", "MAJ", "LTC", "COL", "BG", "MG", "LTG", "GEN", "GOA"]; // General staff grouped into Officers.
//var GeneralStaff = ["BG", "MG", "LTG", "GEN", "GOA"]; // General staff shall be assigned manually.

//When the bot is ready.
bot.on('ready', () => {
    console.log("Connected as " + bot.user.tag);

    function doSync() {
        let server = bot.guilds.get('discordServerID');
        let discordProfile = server.members.get(user.discord_id);
        // Assign Enlisted Roles
        users.forEach(user => {
            let shortRank = user.rank_shorthand;
            if (Enlisted.includes(shortRank)) {
                if (!discordProfile.Roles.includes('Enlisted')) {
                    discordProfile.addRole('Enlisted');
                }
            }
        });

        // Assign NCO roles
        users.forEach(user => {
            let shortRank = user.rank_shorthand;
            if (NCO.includes(shortRank)) {
                if (!discordProfile.Roles.includes('NCO')) {
                    discordProfile.addRole('NCO');
                }
            }
        });

        // Assign Officer
        users.forEach(user => {
            let shortRank = user.rank_shorthand;
            if (Officer.includes(shortRank)) {
                if (!discordProfile.Roles.includes('Officer')) {
                    discordProfile.addRole('Officer');
                }
            }
        });

        // Assign Active Member Role
        users.forEach(user => {
            let shortRank = user.rank_shorthand;
            if (Officer.includes(shortRank)) {
                if (!discordProfile.Roles.includes('Active')) {
                    discordProfile.addRole('Active');
                }
            }
        });
    }
});

// Crash reporting
bot.on('disconnect', () => console.error('Connection Lost...'));
bot.on('reconnecting', () => console.log('Attempting to reconnect....'));
bot.on('error', error => console.error(error));
bot.on('warn', info => console.error(info));

// Message Eventhandler
bot.on("message", msg => {

    // Quick command to make sure the bot works and hasen't crashed.
    if (msg.content.toLowerCase().includes("!bot")) {
        msg.reply("I'm here!");
    };
});

//Bot login
bot.login(botLogin).catch(err => console.log(err));