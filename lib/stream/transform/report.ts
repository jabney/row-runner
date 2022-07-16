import { createWriteStream } from "fs"
import { EOL } from "os"
import { Stream } from "stream"
import { Row } from "../../row"

export type ReportFn<T> = (meta: T) => string[][]

export const report = <T = any>(path: string, handler: ReportFn<T>) => {
    let cachedRow: Row
    const stream = new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            cachedRow = row
            next(null, row)
        },
    }).on("close", () => {
        const writeStream = createWriteStream(path)
        const meta = Object.fromEntries(cachedRow?.meta.entries() ?? []) as T
        const rows = handler(meta)
        rows.forEach((row) => writeStream.write(row.join(",") + EOL))
        writeStream.close()
    })
    return stream
}
