import * as Discord from "discord.js";
import { creditSystem } from "..";
import * as storage from "node-persist";
import { CommandPrefix, ServerCommands } from '../commands';
import { SanitizeMarkdown } from '../util';

export async function handleReactionAdd(messageReaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): Promise<void> {
    const messageAuthorId = messageReaction.message.author.id;
    switch (messageReaction.emoji.identifier) {
        case '%F0%9F%91%8D': //:+1:
            if (user.id != messageAuthorId) {
                if (creditSystem[messageAuthorId] == null) {
                    creditSystem[messageAuthorId] = { credits: 1 }
                } else {
                    creditSystem[messageAuthorId].credits++;
                }

                await storage.setItem('credits', creditSystem)
                break;
            } else {
                messageReaction.message.author.send(`<@${messageAuthorId}> don't +1 your own comments.`);
            }
            break;

    }
};

export async function handleReactionRemove(messageReaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): Promise<void> {
    switch (messageReaction.emoji.identifier) {
        case '%F0%9F%91%8D': //:+1:
            if (user.id != messageReaction.message.author.id) {
                if (creditSystem[messageReaction.message.author.id] == null) {
                    creditSystem[messageReaction.message.author.id] = { credits: 0 }
                } else {
                    creditSystem[messageReaction.message.author.id].credits--;
                }

                await storage.setItem('credits', creditSystem)
            } else {
                messageReaction.message.author.send(`<@${messageReaction.message.author.id}> thanks.`);
            }
            break;
    }
};

export function handleMessage(message: Discord.Message): void {
    if (message.content[0] == CommandPrefix) {
        const content = SanitizeMarkdown(message.content).slice(1, message.content.length);
        const params = content.split(' ');
        if (params.length > 0) {
            const command = params[0];
            switch (command) {
                case ServerCommands.credits:
                    if (creditSystem[message.author.id] != null) {
                        message.author.send(`<@${message.author.id}> you have ${creditSystem[message.author.id].credits} credits`);
                    } else {
                        message.author.send(`<@${message.author.id}> you have no credits yet`);
                    }
                    break;
            }
        }
    }
}