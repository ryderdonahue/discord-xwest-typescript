import * as Discord from "discord.js";
import { client } from "./";
import { Config } from './config';

export function handleReactionAdd(messageReaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): void {
    const messageAuthorId = messageReaction.message.author.id;
    switch (messageReaction.emoji.identifier) {
        case '%E2%9C%85': //✓
            if (messageAuthorId == Config.superUser && messageReaction.message.channel.id == Config.roleChannelId) {
                const guild = client.guilds.cache.find(guild => guild.id === Config.xwestServerId);
                if (guild) {

                    const member = guild.members.cache.find(m => m.id === user.id);
                    if (member) {
                        const role = messageReaction.message.mentions.roles.first();
                        if (role) {
                            member.send(role.name + " has been added to your person");
                            member.roles.add(role);
                        }
                    }
                }
            }
            break;
    }
};


export function handleReactionRemove(messageReaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): void {
    const messageAuthorId = messageReaction.message.author.id;
    switch (messageReaction.emoji.identifier) {
        case '%E2%9C%85': //✓
            if (messageAuthorId == Config.superUser && messageReaction.message.channel.id == Config.roleChannelId) {
                const guild = client.guilds.cache.find(guild => guild.id === Config.xwestServerId);
                if (guild) {
                    const member = guild.members.cache.find(m => m.id === user.id);
                    if (member) {
                        const role = messageReaction.message.mentions.roles.first();
                        if (role !== undefined) {
                            member.send(role.name + " has been removed from your person");
                            member.roles.remove(role);
                        }
                    }
                }
            }
            break;
    }
};