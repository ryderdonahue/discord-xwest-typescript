import * as Discord from "discord.js";
import { creditSystem, client } from "..";
import { Config } from '../config';
import { CommandPrefix, ServerCommands } from '../commands';
import { SanitizeMarkdown, shuffle } from '../util';
import { EmojiArray, Constants } from '../constants';

let numCurrentPolls = 0;

export async function handleMessage(message: Discord.Message): Promise<void> {
    if (message.content.startsWith(`<@{${Config.botID}}>`) && message.content.indexOf('thank') != -1) {
        message.channel.send(`You're welcome @<` + message.author.id + '>');
    }

    if (message.content.startsWith(`<@{${Config.botID}}>`) && message.content.indexOf('credits') != -1) {
        message.mentions.users.map(user => {
            if (user.id != '447522036492009475') {
                if (creditSystem[user.id] != null) {
                    message.channel.send(`${user.tag} has ${creditSystem[user.id].credits} credits`);
                } else {
                    message.channel.send(`${user.tag} has no credits yet`);
                }
            }
        });
    }

    if (message.content[0] == CommandPrefix) {
        const content = SanitizeMarkdown(message.content).slice(1, message.content.length);
        const params = content.split(' ');
        if (params.length > 0) {
            const command = params[0];
            switch (command) {
                case ServerCommands.help:
                    message.author.send(Constants.helpMessage);
                    message.channel.send("Command instructions have been DMd to you.");
                    break;
                case ServerCommands.roll:
                    if (params.length > 1) {
                        if (params[1].charAt(0).toLocaleLowerCase() == "d") {
                            const number = Number(params[1].slice(1, params[1].length));
                            if (!isNaN(number)) {
                                message.channel.send("`D" + number + " rolled:" + Math.floor(Math.random() * Math.floor(number) + 1) + "`")
                            }
                        }
                    }
                    break;
                case ServerCommands.request:
                    if (params.length > 1) {
                        client.guilds.cache.find(guild => guild.id === Config.xwestServerId).
                            members.cache.find(member => member.id == Config.superUser).
                            send(message.author.username + " requests: " + content.slice(params[0].length, content.length));
                    } else {
                        message.channel.send("Please attach a request with your request. Example: `!request money printing feature`");
                    }
                    break;
                case ServerCommands.poll:
                    if (params.length > 3 && !isNaN(Number(params[1]))) {
                        if (params.length > 10) {
                            message.channel.send("Too many poll items, please limit to 8");
                        }
                        if (numCurrentPolls < 5) {
                            numCurrentPolls++;
                            const minutes = Math.max(Math.min(Number(params[1]), 180), .5);
                            let reply = `Choose between the options below:\n`;
                            let emojiArray = EmojiArray.slice(0, EmojiArray.length);
                            const options = [];
                            emojiArray = shuffle(emojiArray);
                            for (let i = 2; i < params.length; i++) {
                                reply += emojiArray[i - 2].emojiValue + ": " + params[i] + "\n";
                                options.push({ emoji: emojiArray[i - 2], val: params[i], votes: -1, participants: [] });
                            }

                            const pollMessage = (await message.channel.send(`\`\`\`POLL STARTED - OPEN FOR ${minutes} MINUTES:\n${reply}\`\`\``));
                            for (let i = 0; i < options.length; i++) {
                                pollMessage.react(options[i].emoji.discordValue);
                            }

                            setTimeout(async () => {
                                pollMessage.reactions.cache.forEach((reaction) => {
                                    const opt = options.find(option => option.emoji.discordValue == reaction.emoji.identifier);
                                    if (opt) {
                                        opt.votes += reaction.count;
                                        opt.participants = reaction.users.cache.map(user => user.username);
                                    };
                                });
                                numCurrentPolls--;
                                const sortedOptions = options.sort((a, b) => b.votes - a.votes);

                                let results = "```Winner of the poll is:\n";
                                sortedOptions.forEach((opt, indx) => {
                                    results += `#${indx + 1} ${opt.val}: ${opt.votes} votes  ${opt.participants.slice(1, opt.participants.length).join(', ')}\n`;
                                })
                                results += "```";

                                message.channel.send(results);

                            }, minutes * 60000);
                        } else {
                            message.channel.send("Too many concurrent polls, please wait for one to finish.");
                        }
                    } else {
                        message.channel.send("Invalid poll arguments, sample poll: `!poll 5 Overwatch PUBG Apex`");
                    }
                    break;
            }
        }
    }
}