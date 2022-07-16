import { createWriteStream } from "fs"
import { EOL } from "os"
import { Stream } from "stream"
import { Row } from "../../row"

export type ReportFn = (meta: any) => string[][]

export const report = (path: string, handler: ReportFn) => {
    let cachedRow: Row
    const stream = new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            cachedRow = row
            next(null, row)
        },
    }).on("close", () => {
        const writeStream = createWriteStream(path)
        if (cachedRow != null) {
            const meta = Object.fromEntries(cachedRow == null ? [] : [...cachedRow.meta.entries()])
            const rows = handler(meta)
            rows.forEach((row) => writeStream.write(row.join(",") + EOL))
        }
        writeStream.close()
    })
    return stream
}
