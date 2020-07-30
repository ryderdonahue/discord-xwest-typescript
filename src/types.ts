import * as Discord from "discord.js";

export interface Reminder {
    message: Discord.Message,
    hour: number,
    minute: number,
    meridian: string,
    reminder: string,
    authorId: string,
}