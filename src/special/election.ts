export const politicsChannelId = '238478092602048513';

export const GetDaysUntilInauguration = (): number => {
    const dateDiff = Math.abs(new Date().getTime() - new Date(2021, 0, 20).getTime())
    return Math.ceil(dateDiff / (1000 * 3600 * 24));
}

export const GetComicalName = (): string => {
    const date = GetDaysUntilInauguration();
    const topics = [
        `${date} days until Seal Team Six breach and clears the White House`,
        `${date} days until President Biden comes home again`,
        `${date} days until the cheap bronzer is scrubbed from the oval office walls`,
        `${date} days until timeline restabalization `,
        `${date} days until timeline restabilization`,
        `${date} days until Obama’s presidential portrait is unveiled `,
        `${date} days of employment remaining for the children of the Orange Menace.`,
        `${date} days remaining until harmonic convergence`,
        `${date} days remaining of tax-payer funded mar a lago visits`,
        `${date} days until the nightmare ends`,
        `${date} days until history’s biggest loser is removed from office`,
        `${date} days until grace is returned to the highest office of the land`,
        `${date} days until a the first time a woman of color takes executive office`,
        `${date} days to a first-pupper returning to the White House staff`,
        `${date} days remaining on the lease to Putin’s most valuable asset`,
        `${date} days before the GOP cares about the deficit again`,
        `${date} days of White House’s menu being hamberders all day erryday `,
        `${date} days until literacy returns to the White House`,
        `${date} days until the Daily Intelligence Briefing is observed by a literate person`,
        `${date} days until a Special Prosecutor is appointed to investigate Agent Orange`,
        `${date} days until this status is updated`,
        `${date} days remaining in 45’s prenup is reviewed and executed on`,
        `${date} days until Mike’s fly can retire and go home to their children`,
        `${date} days before USSS takes away Joe’s right to drive a motor vehicle`,
        `${date} days until a health diet returns to the chefs menu in the White House`,
        `${date} days remaining before Twitter bans 45 (hopefully)`,
        `${date} days until adults are in-charge again`,
        `${date} days until a democratically elected President is holding office again`,
        `${date} days remain of a undemocratically elected “president”`,
        `${date} days until Twitter loses relevancy as a executive memo delivery system`,
    ]

    return topics[Math.round(topics.length * Math.random())];
}