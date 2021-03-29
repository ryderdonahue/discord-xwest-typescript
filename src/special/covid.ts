import { formatRate } from '../util';
import { CovidStateData, CovidUSData } from '../types';
import * as Discord from "discord.js";
export const covidChannelId = '687120053086322714';
import got from "got";

const stateCurrentApiSrc = (state: string): string => `https://api.covidtracking.com/v1/states/${state}/daily.json`;
const usCurrentApiSrc = `https://api.covidtracking.com/v1/us/daily.json`;
// simple https get with json parsing of covid data
export const getCovidData = async (channel: Discord.TextChannel) => {
    // const stateData = await got<CovidStateData[]>(stateCurrentApiSrc("wa"), { responseType: "json"});
    // const usData = await got<CovidUSData[]>(usCurrentApiSrc, { responseType: "json"});
    // let stats = ""; 
    // stats += summarizeCovidData(usData.body[0], usData.body,"US data", usCurrentApiSrc);
    // const lastValidStateData = stateData.body.find((value: CovidStateData) => value.positiveIncrease != 0);

    // stats += summarizeCovidData(lastValidStateData, stateData.body,  "Washington Data", stateCurrentApiSrc("wa"));

    // channel.send(stats);
}

const getTrendData = (data: CovidStateData[] | CovidUSData[]) => {
    const firstValidIndex = data.findIndex((datum) => datum.positiveIncrease != 0);
    let averageHospitalizationsIncrease = 0;
    let averagePositiveCasesIncrease = 0;
    let averageDeathsIncrease = 0;
    for (let i = firstValidIndex; i < firstValidIndex + 5; i++) {
        const datum = data[i];
        averageHospitalizationsIncrease += datum.hospitalizedIncrease;
        averagePositiveCasesIncrease += datum.positiveIncrease;
        averageDeathsIncrease += datum.deathIncrease;
    }

    averageDeathsIncrease = Math.round(averageDeathsIncrease / 5);
    averagePositiveCasesIncrease = Math.round(averagePositiveCasesIncrease / 5);
    averageHospitalizationsIncrease = Math.round(averageHospitalizationsIncrease / 5);

    return { averageHospitalizationsIncrease, averagePositiveCasesIncrease, averageDeathsIncrease };
}

const summarizeCovidData = (data: CovidStateData | CovidUSData, fullData: CovidStateData[] | CovidUSData[], title: string, src: string): string => {
    const averagedData = getTrendData(fullData);
    return `\`\`\`
${title} as of: ${new Date(data.dateChecked).toLocaleString()}
Data sourced from: ${src}
State total cases: ${data.positive.toLocaleString()} 
Case increase: ${formatRate(data.positiveIncrease)}
Currently hospitalized: ${data.hospitalizedCurrently.toLocaleString()}
Hospitalized increase: ${formatRate(data.hospitalizedIncrease)}
Ventilator current usage: ${data.onVentilatorCurrently.toLocaleString()}
Death increase: ${formatRate(data.deathIncrease)}
Total deaths: ${data.death.toLocaleString()}
5 Day Averages:
    Case Increase: ${formatRate(averagedData.averagePositiveCasesIncrease)} 
    Hospitalization Increase: ${formatRate(averagedData.averageHospitalizationsIncrease)} 
    Death Increase: ${formatRate(averagedData.averageDeathsIncrease)} 
\`\`\``;
};
