import * as https from "https";
import { IncomingMessage } from 'http';
import { formatRate } from '../util';
import { CovidStateData } from '../types';
import * as Discord from "discord.js";
export const covidChannelId = '687120053086322714';
// simple https get with json parsing of covid data
export const getCovidData = (channel: Discord.TextChannel) => {
    https.get("https://api.covidtracking.com/v1/states/wa/daily.json", (res: IncomingMessage) => {
        let body = "";
        res.on("data", (chunk) => {
            body += chunk;
        });

        res.on("end", () => {
            try {
                let data = JSON.parse(body) as CovidStateData[];
                if (data) {
                    const lastdata = data.find((value: CovidStateData) => value.positiveIncrease != 0);
                    if (lastdata) {
                        const stats = `\`\`\`
Data sourced from: https://api.covidtracking.com/v1/states/wa/daily.json
Date of last valid data: ${new Date(lastdata.dateModified).toLocaleString()}
State population: ~7,615,000
State total cases: ${lastdata.positive.toLocaleString()} 
Case increase: ${formatRate(lastdata.positiveIncrease)}
Currently hospitalized: ${lastdata.hospitalizedCurrently.toLocaleString()}
Hospitalized increase: ${formatRate(lastdata.hospitalizedIncrease)}
Ventilator current usage: ${lastdata.onVentilatorCurrently.toLocaleString()}
Death increase: ${formatRate(lastdata.deathIncrease)}
Total deaths: ${lastdata.death.toLocaleString()}\`\`\`
                                    `;
                        channel.send(stats);
                    }
                }
            } catch (error) {
                console.error(error.message);
            };
        });
    });
}