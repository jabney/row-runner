type OnMatch = (index: number, match: string, ...groups: string[]) => void

export const each = (regex: RegExp, str: string, onMatch: OnMatch) => {
    const re = new RegExp(regex, regex.global ? regex.flags : `${regex.flags}g`)
    let i = 0
    for (const match of str.matchAll(re)) {
        const [m, ...groups] = match
        onMatch(i++, m, ...groups)
    }
}
