import * as Discord from "discord.js";

const urlRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm;

interface UrlRecord {
    url: string;
    user: string;
    userId: string;
    date: Date;
}

const inMemoryUrlCache: Map<string, UrlRecord> = new Map();

export async function handleMessage(message: Discord.Message): Promise<void> {
    var regexResults = message.content.match(urlRegex);
    var exempt = message.content.indexOf('repost');
    if (regexResults && regexResults.length > 0 && exempt == -1) {
        regexResults.map((url: string) => {
            const cachedResult = inMemoryUrlCache.get(url);
            if (cachedResult) {
                message.author.send(
                    `The url you just posted was already posted by ${cachedResult.user} on ${cachedResult.date.toDateString()} at ${cachedResult.date.toTimeString()}.
                    \nConsider removing your post or letting others know its a repost.
                    \n${url}`
                );
                message.react("%F0%9F%94%84");
            } else {
                inMemoryUrlCache.set(url, { url: url, user: message.author.username, userId: message.author.id, date: new Date(Date.now()) });
            }
        });
    }
}