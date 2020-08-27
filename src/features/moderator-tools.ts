import * as Discord from "discord.js";
import { warningSystem } from "..";
import { checkIfMod, checkIfDuplicate } from '../util';
import { Config } from '../config';
import { CommandPrefix, ServerCommands } from '../commands';
import { GenerateServerStats } from '../stats';

let regionMessageId = '0';
export async function handleReactionAdd(messageReaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): Promise<void> {
    const messageAuthorId = messageReaction.message.author.id;
    const messageId = messageReaction.message.id;
    const message = messageReaction.message;
    const emojiIdentifier = messageReaction.emoji.identifier;

    switch (emojiIdentifier) {
        case '%E2%9A%A0%EF%B8%8F': //⚠""
            if (checkIfMod(user.id)) {
                if (!warningSystem[messageAuthorId]) {
                    warningSystem[messageAuthorId] = { warnings: 0, warnedMessages: [] };
                }

                if (!checkIfDuplicate(warningSystem[messageAuthorId].warnedMessages, messageId)) {
                    messageReaction.message.channel.send(`<@${messageAuthorId}> a moderator has flagged your message with a warning`);
                    warningSystem[messageAuthorId].warnedMessages.push(messageId);
                }

                warningSystem[messageAuthorId].warnings++;
            }
            break;
    }

    if (messageId == regionMessageId && user.id != Config.botID) {
        switch (emojiIdentifier) {
            case '%F0%9F%87%AA': //E
                await message.guild.edit({ region: 'us-east' }, `Requested by Moderator ${messageReaction.message.author.username}`);
                message.channel.send('Server region has been changed to **US-EAST**');
                break;
            case '%F0%9F%87%BC': //W
                await message.guild.edit({ region: 'us-west' }, `Requested by Moderator ${messageReaction.message.author.username}`);
                message.channel.send('Server region has been changed to **US-WEST**');
                break;
            case '%F0%9F%87%A8': //C
                await message.guild.edit({ region: 'us-central' }, `Requested by Moderator ${messageReaction.message.author.username}`);
                message.channel.send('Server region has been changed to **US-CENTRAL**');
                break;
            case '%F0%9F%87%B8': //S
                await message.guild.edit({ region: 'us-south' }, `Requested by Moderator ${messageReaction.message.author.username}`);
                message.channel.send('Server region has been changed to **US-SOUTH**');
                break;
        }
    }
};

export function handleReactionRemove(messageReaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): void {
    const messageAuthorId = messageReaction.message.author.id;
    switch (messageReaction.emoji.identifier) {
        case '%E2%9A%A0': //⚠
            if (checkIfMod(user.id)) {
                if (!warningSystem[messageAuthorId]) {
                    warningSystem[messageAuthorId] = { warnings: 0, warnedMessages: [] };
                }

                warningSystem[messageAuthorId].warnings--;
            }

            break;
    }
};

export async function handleMessage(message: Discord.Message): Promise<void> {
    if (message.content[0] == CommandPrefix) {
        if (message.author.id == Config.superUser) {
            const content = message.content.slice(1, message.content.length);
            const params = content.split(' ');
            if (params.length > 0) {
                const command = params[0];
                switch (command) {
                    case ServerCommands.wipe:
                        if (params.length > 1) {
                            const deleteAmount = Number(params[1]);
                            if (!isNaN(deleteAmount)) {
                                let count = -1;
                                const messages = await message.channel.messages.fetch();
                                messages.forEach((message) => {

                                    if (count < deleteAmount) {
                                        message.delete();
                                    }
                                    count++;
                                });
                            }
                        }
                        break;
                    case ServerCommands.say:
                        message.channel.send(message.content.slice(9, message.content.length));
                        message.delete();
                        break;
                    case ServerCommands.prune:
                        message.mentions.members.forEach((user) => {
                            user.send("Sorry " + user.displayName + " you have been pruned from XWest due to inactivity. Please reach out to an admin or member if you would like to be readded.").then(() => {
                                user.kick();
                            })
                        });
                        break;
                    case ServerCommands.stats:
                        message.delete();
                        GenerateServerStats(message)
                        break;
                }
            }
        }
        if (checkIfMod(message.author.id)) {
            const content = message.content.slice(1, message.content.length);
            const params = content.split(' ');
            if (params.length > 0) {
                const command = params[0];
                switch (command) {
                    case ServerCommands.region:
                        {
                            const regionMessage = await message.channel.send(`Current region **${message.guild.region.toUpperCase()}**\nTo change react below:\n    **🇼:US-WEST   🇪:US-EAST   🇨:US-CENTRAL   🇸:US-SOUTH**`);

                            regionMessage.react('%F0%9F%87%BC');
                            regionMessage.react('%F0%9F%87%AA');
                            regionMessage.react('%F0%9F%87%A8');
                            regionMessage.react('%F0%9F%87%B8');
                            regionMessageId = regionMessage.id;
                        }
                        break;
                }
            }
        }
    }
}