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
// ******* END OF API STUFF *******

//When the bot is ready.
bot.on('ready', () => {
    console.log("Connected as " + bot.user.tag);

    // This is inside 'ready' because discord api can only be interacted with inside an event handler...
    // Role Assignment Concept:
    let userCache = [
        {
            discord_id: "201893080805146624",
            username: "Vex"
        },
        {
            discord_id: "104461066662060032",
            username: "Jarvis"
        }
    ];
    
    function doSync() {
        let users = userCache; // in future this would be a db call
        let server = bot.guilds.get('discordServerID');
     
        users.forEach(user => {
            let discordProfile = server.members.get(user.discord_id);
            discordProfile.addRole('roleID'); // genstaff role
        })
    }

    doSync();
});

// Crash reporting
bot.on('disconnect', () => console.error('Connection Lost...'));
bot.on('reconnecting', () => console.log('Attempting to reconnect....'));
bot.on('error', error => console.error(error));
bot.on('warn', info => console.error(info));

// Message Eventhandler
bot.on ("message", msg => {

    // Quick command to make sure the bot works and hasen't crashed.
    if(msg.content.toLowerCase().includes("!bot")) {
        msg.reply("I'm here!");
    };
});

//Bot login
bot.login(botLogin).catch(err => console.log(err));