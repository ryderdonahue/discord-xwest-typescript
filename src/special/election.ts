

export const GetDaysUntilInauguration = (): Number => {
    const dateDiff = Math.abs(new Date().getTime() - new Date(2021, 0, 20).getTime())
    return Math.ceil(dateDiff / (1000 * 3600 * 24));
} 