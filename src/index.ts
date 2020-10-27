import * as Discord from "discord.js";
import * as date from 'date-and-time';

import { apiKey } from "./botkey";
import * as storage from "node-persist";
import { Config } from './config';
import * as RoleManagement from './features/role-management';
import * as ModeratorTools from './features/moderator-tools';
import * as CreditManagement from './features/credit-management';
import * as BotBehavior from './features/bot-behavior';

export const client = new Discord.Client();

export let creditSystem = null;
export let warningSystem = null;

async function main() {
    // TODO: Move away from this archiac local storage option
    await storage.init( /* options ... */);
    creditSystem = await storage.getItem('credits');
    warningSystem = await storage.getItem('warnings');

    if (creditSystem == null) {
        await storage.setItem('credits', {});
    }

    if (warningSystem == null) {
        await storage.setItem('warnings', {});
    }

    client.on('error', (error) => { console.log(error) });

    // see botkey.sample.ts for guidance
    client.login(apiKey());

    client.on('ready', async () => {
        console.log('Xwest Bot onlne');
        client.user.setActivity("!help for commands", { name: "!help for commands", type: "LISTENING" });

        // get message history for #role channel such that these messages can be monitored for reactions
        const XWestServer = client.guilds.cache.find(guild => guild.id === Config.xwestServerId);
        const RoleChannel = await XWestServer.channels.cache.find(channel => channel.id === Config.roleChannelId);
        const hydratedRoleChannel = await RoleChannel.fetch() as Discord.TextChannel;
        await hydratedRoleChannel.messages.fetch();

        // setup reminders check
        setTimeout(function () {
            setInterval(()=>BotBehavior.CheckReminders(client), 60000);
            BotBehavior.CheckReminders(client);
        }, (60 - new Date().getSeconds()) * 1000);
    });

    // WELCOME MESSAGE FOR NEW MEMBERS
    client.on('guildMemberUpdate', async function (oldMember: Discord.GuildMember, newMember: Discord.GuildMember) {
        if (!oldMember.roles.cache.has(Config.memberRoleId) && newMember.roles.cache.has(Config.memberRoleId)) {
            newMember.send("Welcome to XWest! \nYou have just been given the #member status by an admin!\n**Please checkout the _#roles_ channel to set yourself up with some roles!**");
        }
    });

    // SETUP BOT LISTENERS

    // ROLE MANAGEMENT
    client.on('messageReactionAdd', RoleManagement.handleReactionAdd);
    client.on('messageReactionRemove', RoleManagement.handleReactionRemove);

    // CREDIT MANAGEMENT
    client.on('messageReactionRemove', CreditManagement.handleReactionRemove);
    client.on('messageReactionAdd', CreditManagement.handleReactionAdd);
    client.on('message', CreditManagement.handleMessage);

    // MODERATOR TOOLS
    client.on('messageReactionRemove', ModeratorTools.handleReactionRemove);
    client.on('messageReactionAdd', ModeratorTools.handleReactionAdd);
    client.on('message', ModeratorTools.handleMessage);

    // BOT BEHAVIOR
    client.on('message', BotBehavior.handleMessage);
    client.on('messageReactionAdd', BotBehavior.handleReactionAdd);
}

main();