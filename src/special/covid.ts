import { formatRate } from '../util';
import { CovidStateData, CovidUSData } from '../types';
import * as Discord from "discord.js";
export const covidChannelId = '687120053086322714';
import  got from "got";

const stateCurrentApiSrc = (state: string): string => `https://api.covidtracking.com/v1/states/${state}/daily.json`
const usCurrentApiSrc = `https://api.covidtracking.com/v1/us/current.json`;
// simple https get with json parsing of covid data
export const getCovidData = async (channel: Discord.TextChannel) => {
    const stateData = await got<CovidStateData[]>(stateCurrentApiSrc("wa"), { responseType: "json"});
    const usData = await got<CovidUSData[]>(usCurrentApiSrc, { responseType: "json"});
    console.log(usData.body);
    let stats = ""; 
    stats += summarizeCovidData(usData.body[0], "US data", usCurrentApiSrc);
    const lastValidStateData = stateData.body.find((value: CovidStateData) => value.positiveIncrease != 0);
    
    stats += summarizeCovidData(lastValidStateData, "Washington Data", stateCurrentApiSrc("wa"));

    channel.send(stats);
}

const summarizeCovidData = (data: CovidStateData | CovidUSData, title: string, src: string): string => {
    return `\`\`\`
    ${title} as of: ${new Date(data.dateChecked).toLocaleString()}
    Data sourced from: ${src}
    State total cases: ${data.positive.toLocaleString()} 
    Case increase: ${formatRate(data.positiveIncrease)}
    Currently hospitalized: ${data.hospitalizedCurrently.toLocaleString()}
    Hospitalized increase: ${formatRate(data.hospitalizedIncrease)}
    Ventilator current usage: ${data.onVentilatorCurrently.toLocaleString()}
    Death increase: ${formatRate(data.deathIncrease)}
    Total deaths: ${data.death.toLocaleString()}\`\`\``;
};
