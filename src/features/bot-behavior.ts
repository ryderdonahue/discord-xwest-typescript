import * as Discord from "discord.js";
import { creditSystem, client } from "..";
import { Config } from '../config';
import { CommandPrefix, ServerCommands } from '../commands';
import { SanitizeMarkdown, shuffle } from '../util';
import { EmojiArray, Constants } from '../constants';
import * as date from 'date-and-time';
import { Reminder } from '../types';
import { getCovidData, covidChannelId } from '../special/covid';

let reminders: Reminder[] = [];

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
                case ServerCommands.reminder:
                    if (reminders.length < Constants.maxReminders) {
                        if (params.length > 2) {
                            const d = date.parse(params[1], 'hh:mmA');
                            let reminderMessage = '';
                            for (let i = 2; i < params.length; i++) {
                                reminderMessage += params[i] + ' ';
                            }

                            const reminder = await message.channel.send(`Reminder set for ${date.format(d, "hh:mm A")} to ${reminderMessage}by <@${message.author.id}>\n\`✅ to subscribe and 🛑 to stop and ⚡ to trigger immediately\``);

                            reminder.react('%E2%9C%85');
                            reminder.react('%F0%9F%9B%91');
                            reminder.react('%E2%9A%A1');
                            reminders.push({
                                message: reminder,
                                hour: d.getHours(),
                                minute: d.getMinutes(),
                                meridian: date.format(d, 'A'),
                                reminder: reminderMessage,
                                authorId: message.author.id,
                            });
                        }
                    } else {
                        message.author.send("Too many reminders currently set.")
                    }
                    break;
                case ServerCommands.help:
                    message.author.send(Constants.helpMessage);
                    message.channel.send("Command instructions have been DMd to you.");
                    break;
                case ServerCommands.covid:
                        getCovidData(message.channel as Discord.TextChannel);
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

export async function CheckReminders(client: Discord.Client) {
    const now = new Date();
    for (let i = reminders.length - 1; i >= 0; i--) {
        const reminder = reminders[i];
        const hour = now.getHours();
        const minute = now.getMinutes();
        const meridian = date.format(now, 'A');
        if (hour == reminder.hour && minute == reminder.minute && reminder.meridian == meridian) {
            reminder.message = await reminder.message.fetch();
            reminder.message.channel.send(`Reminder: ${reminder.reminder}`);
            let announce = '';
            reminder.message.reactions.cache.forEach((reaction) => {
                announce += reaction.users.cache.map((user) => user.id !== Config.botID ? `<@${user.id}>` : '').join(' ');
            });

            reminder.message.channel.send(announce);

            reminders = reminders.splice(i, 1);
        }
    };

    if (now.getHours() == 12 && now.getMinutes() == 0) {
        const covidChannel = client.channels.cache.find((channel=>channel.id === covidChannelId));
        if (covidChannel) {
            getCovidData(covidChannel as Discord.TextChannel);
        }
    }
}


export async function handleReactionAdd(messageReaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): Promise<void> {
    switch (messageReaction.emoji.identifier) {
        case '%F0%9F%9B%91': // stop sign
            for (let i = reminders.length - 1; i >= 0; i--) {
                const reminder = reminders[i];
                if (reminder.message.id == messageReaction.message.id && (user.id === reminder.authorId || user.id === Config.superUser)) {
                    messageReaction.message.channel.send(`Reminder ${reminder.reminder} has stopped`);
                    reminders = reminders.splice(i, 1);
                    reminder.message.delete();
                }
            }
            break;
        case '%E2%9A%A1': // zap 
            for (let i = reminders.length - 1; i >= 0; i--) {
                const reminder = reminders[i];
                if (reminder.message.id == messageReaction.message.id && (user.id === reminder.authorId || user.id === Config.superUser)) {
                    reminder.message = await reminder.message.fetch();
                    reminder.message.channel.send(`Reminder: ${reminder.reminder}`);
                    let announce = '';
                    reminder.message.reactions.cache.forEach((reaction) => {
                        announce += reaction.users.cache.map((user) => user.id !== Config.botID ? `<@${user.id}>` : '').join(' ');
                    });

                    reminder.message.channel.send(announce);

                    reminders.splice(i, 1);
                }
            }
            break;
    }
};