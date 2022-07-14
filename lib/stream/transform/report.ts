import { createWriteStream } from "fs"
import { EOL } from "os"
import { Stream } from "stream"
import { StreamData } from "../../stream-data"

export type ReportFn = (meta: any) => string[][]

export const report = (path: string, handler: ReportFn) => {
    let streamData: StreamData
    const stream = new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            streamData = data
            next(null, data)
        },
    }).on("close", () => {
        const writeStream = createWriteStream(path)
        if (streamData != null) {
            const meta = Object.fromEntries(streamData == null ? [] : [...streamData.meta.entries()])
            const rows = handler(meta)
            rows.forEach((row) => writeStream.write(row.join(",") + EOL))
        }
        writeStream.close()
    })
    return stream
}
