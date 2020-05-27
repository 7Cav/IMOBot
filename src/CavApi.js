// Packages
const axios = require('axios').default;

class CavAPI {
    constructor(token, discordBot) {
        this.auth = token;
        this.bot = discordBot;
    }

    // Base Cav API call.
    instance = axios.create({
        baseURL: 'https://api.7cav.us/v1/',
        withCredentials: false,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + this.auth
        }
    });

    async getActiveUsers() {
        try {
            return await instance.get('users/active');
        } catch (error) {
            logger.error(error);
        }
    }

    // Get Retired users of Cav API.
    async getRetUsers() {
        try {
            return await instance.get('users/ret');
        } catch (error) {
            logger.error(error);
        }
    }

    // Get Wall of Honor users of Cav API.
    async  getWohUsers() {
        try {
            return await instance.get('users/woh');
        } catch (error) {
            logger.error(error);
        }
    }

    // Get Reserve users of Cav API.
    async  getResUsers() {
        try {
            return await instance.get('users/reserve');
        } catch (error) {
            logger.error(error);
        }
    }

    // Get Discharged users of Cav API.
    async  getDischUsers() {
        try {
            return await instance.get('users/disch');
        } catch (error) {
            logger.error(error);
        }
    }

    // Get Cav API user via Discord Id.
    async  getUserFromDiscordID(discordId) {
        try {
            return await instance.get('user/discord/' + discordId);
        } catch (error) {
            logger.error(error);
        }
    }

    // Global Sync function
    async  runGlobalSync() {
        // let [active, ret, disch] = await Promise.all([getActiveUsers(), getRetUsers(), getDischUsers()]);

        this.getActiveUsers().then(res => {
            res.data.data.users
            .filter(user => user.discord_id)
            .forEach(user => {
                syncDiscordUser(user.discord_id, user);
            });
        });

        this.getRetUsers().then(res => {
            res.data.data.users
                .filter(user => user.discord_id)
                .forEach(user => {
                    syncDiscordUser(user.discord_id, user);
                });
        });

        this.getWohUsers().then(res => {
            res.data.data.users
                .filter(user => user.discord_id)
                .forEach(user => {
                    syncDiscordUser(user.discord_id, user);
                });
        });

        this.getResUsers().then(res => {
            res.data.data.users
                .filter(user => user.discord_id)
                .forEach(user => {
                    syncDiscordUser(user.discord_id, user);
                });
        });

        this.getDischUsers().then(res => {
            res.data.data.users
                .filter(user => user.discord_id)
                .forEach(user => {
                    syncDiscordUser(user.discord_id, user);
                });
        });
    }

    // Sync Discord User function
    async syncDiscordUser(discordId, cavUser = null) {

        if (cavUser == null) {
            // attempt to get Cav User via api/user/discord/{id}
            apiUserRequest = await this.getUserFromDiscordID(discordId);

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

        // Discord server...
        let discordServer = bot.guilds.cache.get(config.DiscordServerID);

        if (!discordServer.members.cache.has(discordId)) {
            // Skipping user, no discord account found
            logger.info("No user found in discord. Skipping %s", cavUser.username);
            return;
        }

        // Discord profile...
        let discordProfile = discordServer.members.cache.get(discordId);

        logger.info(`Starting sync for ${cavUser.username}`);
        await discordProfile.roles.remove(Object.values(config.MANAGED_GROUPS))
            .catch(console.error);

        var rolesToSet = [];

        let rankShortName = cavUser.rank_shorthand;

        if (cavUser.roster_id == 3) {
            await discordProfile.roles.add(
                [config.MANAGED_GROUPS.GROUP_RETIRED_ID,
                    config.MANAGED_GROUPS.GROUP_WOH_ID]
                    )
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

}

module.exports = CavAPI;