/*
    Discord bot for 7th Cav discord.

    Made by Vex
*/

// Dependencies
const Discord = require('discord.js');
const config = require('./config.json');
const fs = require("fs")
const bot = new Discord.Client();
const botLogin = config.LoginToken;

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

// This is supposed to return active user data, it responds with [Object, object].
// instance.get("https://api.7cav.us/v1/users/active")
//     .then(function (response) {
//     console.log(response.data);
//     })

//When the bot is ready.
bot.on('ready', () => {
    console.log("Connected as " + bot.user.tag);
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