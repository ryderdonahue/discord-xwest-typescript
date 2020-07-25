import * as Discord from "discord.js";
import { Config } from './config';
import { client } from '.';

interface userStat {
    totalMessageCount: number;
    totalWordCount: number;
    totalCharacterCount: number;
    nickname: string;
    contentShared: number;
    joinDate: number;
    lastMessageDate: number;
    totalEdits: number;
}

interface channelStat {
    totalMessageCount: number;
    totalWordCount: number;
    totalCharacterCount: number;
    nickname: string;
    contentShared: number;
    creationDate: number;
    lastMessageDate: number;
    totalEdits: number;
}

export async function GenerateServerStats(message: Discord.Message): Promise<void> {
    const userStatMap = new Map<string, userStat>();;
    const channelStatMap = new Map<string, channelStat>();
    const XWestServer = client.guilds.cache.find(guild => guild.id === Config.xwestServerId);
    message.channel.send(`Gathering and processing statistics\nPlease be patient\n`);
    const channels = [];
    XWestServer.channels.cache.forEach((channel) => {
        channels.push(channel);
    });
    for (let i = 0; i < channels.length; i++) {
        try {
            const channel = channels[i];
            const hydratedChannel = await channel.fetch();
            message.channel.send(`Loading channel ${hydratedChannel.name}\n`);
            if (hydratedChannel.type == "text") {
                channelStatMap.set(hydratedChannel.name, { nickname: hydratedChannel.name, totalCharacterCount: 0, totalMessageCount: 0, totalWordCount: 0, contentShared: 0, totalEdits: 0, creationDate: null, lastMessageDate: null });
                message.channel.send(`Getting messages for ${hydratedChannel.name}\n`);
                let remainingMessages = 0;
                let lastMessageId = null;
                do {
                    const messages = await (hydratedChannel as Discord.TextChannel).messages.fetch({ limit: 100, before: lastMessageId });
                    messages.forEach((message) => {
                        if (!userStatMap.has(message.author.id)) {
                            userStatMap.set(message.author.id, { totalMessageCount: 0, totalWordCount: 0, nickname: "", totalCharacterCount: 0, contentShared: 0, totalEdits: 0, joinDate: message.createdTimestamp, lastMessageDate: message.createdTimestamp });
                        }

                        channelStatMap.get(hydratedChannel.name).totalMessageCount++;
                        userStatMap.get(message.author.id).totalMessageCount++;
                        userStatMap.get(message.author.id).nickname = message.author.username;
                        if (userStatMap.get(message.author.id).lastMessageDate < message.createdTimestamp) {
                            userStatMap.get(message.author.id).lastMessageDate = message.createdTimestamp;
                        }

                        if (userStatMap.get(message.author.id).joinDate > message.createdTimestamp) {
                            userStatMap.get(message.author.id).joinDate = message.createdTimestamp;
                        }

                        if (channelStatMap.get(hydratedChannel.name).lastMessageDate < message.createdTimestamp || channelStatMap.get(hydratedChannel.name).lastMessageDate) {
                            channelStatMap.get(hydratedChannel.name).lastMessageDate = message.createdTimestamp;
                        }

                        if (channelStatMap.get(hydratedChannel.name).creationDate < message.createdTimestamp || channelStatMap.get(hydratedChannel.name) === null) {
                            channelStatMap.get(hydratedChannel.name).creationDate = message.createdTimestamp;
                        }

                        if (message.editedAt !== null) {
                            userStatMap.get(message.author.id).totalEdits++;
                            channelStatMap.get(hydratedChannel.name).totalEdits++;
                        }

                        if (message.embeds.length == 0) {
                            channelStatMap.get(hydratedChannel.name).totalCharacterCount += message.content.length;
                            channelStatMap.get(hydratedChannel.name).totalWordCount += message.content.split(' ').length;
                            userStatMap.get(message.author.id).totalCharacterCount += message.content.length;
                            userStatMap.get(message.author.id).totalWordCount += message.content.split(' ').length;
                        } else {
                            userStatMap.get(message.author.id).contentShared += message.embeds.length;
                            channelStatMap.get(hydratedChannel.name).contentShared += message.embeds.length;
                        }

                        lastMessageId = message.id;
                    });
                    remainingMessages = messages.size;
                } while (remainingMessages > 0);
            }
        } catch (ex) {
            console.log(ex);
        }
    }

    message.channel.send("FETCHING COMPLETE");
    message.channel.send("CHANNEL STATS");
    let channelStats = '```';
    channelStats += `user,first_message_timestamp,last_message_timestamp,total_message_count,total_word_count,total_character_count,average_words_per_message,average_characters_per_message,content_shared,total_edits\n`;
    userStatMap.forEach((value) => {
        channelStats += `${value.nickname},${value.joinDate},${value.lastMessageDate},${value.totalMessageCount},${value.totalWordCount},${value.totalCharacterCount},${value.totalWordCount / value.totalMessageCount},${value.totalCharacterCount / value.totalMessageCount},${value.contentShared},${value.totalEdits}\n`;
    });

    message.channel.send(channelStats + '```');
    message.channel.send("USER STATS");

    let userStats = '```';
    userStats += 'channel,first_message_timestamp,last_message_timestamp,total_message_count,total_word_count,total_character_count,average_words_per_message,average_characters_per_message,content_shared,total_edits\n';
    channelStatMap.forEach((value) => {
        userStats += `${value.nickname},${value.creationDate},${value.lastMessageDate},${value.totalMessageCount},${value.totalWordCount},${value.totalCharacterCount},${value.totalWordCount / value.totalMessageCount},${value.totalCharacterCount / value.totalMessageCount},${value.contentShared},${value.totalEdits}\n`;
    });
    message.channel.send(userStats + '```');
}