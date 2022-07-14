export const rowExtractor = (separator: string) => {
    const table = new Map<number, string>()

    return (str: string) => {
        if (/"/.test(str)) {
            const v = str
                .replace(/".+?"/g, (m: string, offset: number) => {
                    table.set(offset, m)
                    return `__{{${offset}}}__`
                })
                .split(separator)
                .map((v) => v.replace(/__{{(\d+)}}__/g, (_, n: string) => table.get(+n) || ""))
            return v
        }
        return str.split(",")
    }
}
