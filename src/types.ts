import * as Discord from "discord.js";

export interface Reminder {
    message: Discord.Message,
    hour: number,
    minute: number,
    meridian: string,
    reminder: string,
    authorId: string,
}

export interface CovidStateData {
    date: number;
    state: string;
    positive: number;
    probableCases?: any;
    negative: number;
    pending?: any;
    totalTestResultsSource: string;
    totalTestResults: number;
    hospitalizedCurrently: number;
    hospitalizedCumulative: number;
    inIcuCurrently?: any;
    inIcuCumulative?: any;
    onVentilatorCurrently: number;
    onVentilatorCumulative?: any;
    recovered?: any;
    dataQualityGrade: string;
    lastUpdateEt: string;
    dateModified: Date;
    checkTimeEt: string;
    death: number;
    hospitalized: number;
    dateChecked: Date;
    totalTestsViral?: any;
    positiveTestsViral?: any;
    negativeTestsViral?: any;
    positiveCasesViral: number;
    deathConfirmed: number;
    deathProbable?: any;
    totalTestEncountersViral: number;
    totalTestsPeopleViral?: any;
    totalTestsAntibody?: any;
    positiveTestsAntibody?: any;
    negativeTestsAntibody?: any;
    totalTestsPeopleAntibody?: any;
    positiveTestsPeopleAntibody?: any;
    negativeTestsPeopleAntibody?: any;
    totalTestsPeopleAntigen?: any;
    positiveTestsPeopleAntigen?: any;
    totalTestsAntigen?: any;
    positiveTestsAntigen?: any;
    fips: string;
    positiveIncrease: number;
    negativeIncrease: number;
    total: number;
    totalTestResultsIncrease: number;
    posNeg: number;
    deathIncrease: number;
    hospitalizedIncrease: number;
    hash: string;
    commercialScore: number;
    negativeRegularScore: number;
    negativeScore: number;
    positiveScore: number;
    score: number;
    grade: string;
}
