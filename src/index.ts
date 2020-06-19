import * as Discord from "discord.js";

import { apiKey } from "./botkey";
import { ServerCommands } from "./commands";
import * as storage from "node-persist";
import { Constants, EmojiArray } from './constants';
import { shuffle, SanitizeMarkdown } from './util';

const botID = 447522036492009475;
const roleChannelId = '481676280903761948';
const xwestServerId = '157319510230040576';
const memberRoleId = '180418852109287424';

const commandPrefix = '!';
const mods = [122070915604414464, 122070682149322752, 172211630237548544]
const su = '122070915604414464';

const client = new Discord.Client();

function checkIfMod(id): boolean {
    let isMod = false;
    mods.map(val => {
        if (val == id) {
            isMod = true;
        }
    })

    return isMod;
}

function checkIfDuplicate(array, id): boolean {
    let found = false;
    array.map(val => {
        if (val == id) {
            found = true;
        }
    });

    return found;
}


let numCurrentPolls = 0;
let repostStorage = null;
let creditSystem = null;
let warningSystem = null;

async function main() {
    await storage.init( /* options ... */);
    repostStorage = await storage.getItem('urls');
    creditSystem = await storage.getItem('credits');
    warningSystem = await storage.getItem('warnings');


    if (repostStorage == null) {
        await storage.setItem('urls', {});
    }

    if (creditSystem == null) {
        await storage.setItem('credits', {});
    }

    if (warningSystem == null) {
        await storage.setItem('warnings', {});
    }


    client.on('error', (error) => { console.log(error) });


    client.login(apiKey());

    client.on('ready', async () => {
        console.log('Xwest Bot onlne');
        const XWestServer = client.guilds.cache.find(guild => guild.id === xwestServerId);
        const RoleChannel = await XWestServer.channels.cache.find(channel => channel.id === roleChannelId);
        const hydratedChannel = await RoleChannel.fetch() as Discord.TextChannel;
        await hydratedChannel.messages.fetch();
        client.user.setActivity("!help for commands", { name: "!help for commands", type: "LISTENING" });
    });


    client.on('guildMemberUpdate', async function (oldMember: Discord.GuildMember, newMember: Discord.GuildMember) {
        if (!oldMember.roles.cache.has(memberRoleId) && newMember.roles.cache.has(memberRoleId)) {
            newMember.send("Welcome to XWest! \nYou have just been given the #member status by an admin!\n**Please checkout the _#roles_ channel to set yourself up with some roles!**");
        }
    });

    client.on('messageReactionAdd', async function (messageReaction, user) {
        const messageAuthorId = messageReaction.message.author.id;
        const messageId = messageReaction.message.id;

        switch (messageReaction.emoji.identifier) {
            case '%E2%9C%85': //✓
                if (messageAuthorId == su && messageReaction.message.channel.id == roleChannelId) {
                    const guild = client.guilds.cache.find(guild => guild.id === xwestServerId);
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
    });


    client.on('messageReactionRemove', async function (messageReaction, user) {
        const messageAuthorId = messageReaction.message.author.id;
        const messageId = messageReaction.message.id;
        switch (messageReaction.emoji.identifier) {
            case '%E2%9C%85': //✓
                if (messageAuthorId == su && messageReaction.message.channel.id == roleChannelId) {
                    const guild = client.guilds.cache.find(guild => guild.id === xwestServerId);
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
            case '%E2%9A%A0': //⚠
                if (checkIfMod(user.id)) {
                    if (!warningSystem[messageAuthorId]) {
                        warningSystem[messageAuthorId] = { warnings: 0, warnedMessages: [] };
                    }

                    warningSystem[messageAuthorId].warnings--;
                }

                break;
        }
    });


    client.on('message', async function (message) {
        if (message.author.id == su) {
            let index = message.content.toLowerCase().indexOf("xwest say");
            if (index !== -1) {
                message.channel.send(message.content.slice(9, message.content.length));
                message.delete();
            }
            index = message.content.toLowerCase().indexOf("xwest prune");
            if (index !== -1) {
                message.mentions.members.forEach((user) => {
                    user.send("Sorry " + user.displayName + " you have been pruned from XWest due to inactivity. Please reach out to an admin or member if you would like to be readded.").then(() => {
                        user.kick();
                    })
                });
            }


            index = message.content.toLowerCase().indexOf("xwest stats");
            if (index !== -1) {
                message.delete();
            }
        }

        if (message.content == '<@447522036492009475> credits') {
            if (creditSystem[message.author.id] != null) {
                message.author.send(`<@${message.author.id}> you have ${creditSystem[message.author.id].credits} credits`);
            } else {
                message.author.send(`<@${message.author.id}> you have no credits yet`);
            }
        }

        if (message.content.startsWith('<@447522036492009475>') && message.content.indexOf('credits') != -1) {
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

        if (message.content.startsWith('<@447522036492009475>') && message.content.indexOf('thank') != -1) {
            message.channel.send(`You're welcome @<` + message.author.id + '>');
        }


        if (message.content[0] == commandPrefix) {
            if (message.author.id == su) {
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
                    }
                }
            }

            console.log('unsanitized ' + message.content);
            const content = SanitizeMarkdown(message.content).slice(1, message.content.length);
            console.log('sanitized ' + content);
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
                            // if (!isNaN(params[1])) {
                            //     message.channel.fetchMessages({ limit: params[1] }).then((message2) => {
                            //         message2.deleteAll();
                            //     }).catch(console.error);
                            // }
                        }
                        break;
                    case ServerCommands.request:
                        if (params.length > 1) {
                            client.guilds.cache.find(guild => guild.id === xwestServerId).
                                members.cache.find(member => member.id == su).
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
            // message.author.send('You are not authorized to use admin commands\nYour infraction has been noted and reported to admins');
        }
    }
    );
}


main();