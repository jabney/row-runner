import { createInterface } from "readline"
import { Readable } from "stream"
import { createReadStream } from "fs"
import { rowExtractor } from "../../row-extractor"
import { Header } from "../../header"
import { Row } from "../../row"
import { DoneFn } from "../../types"

/**
 * Read a csv file and convert rows to a stream of values.
 */
export const csv = (path: string, options: Partial<CsvOptions> = {}, done?: DoneFn): Readable => {
    const opts = new CsvOptions(options)
    const rl = createInterface({ input: createReadStream(path) })
    const start = process.hrtime()
    const stream = new Readable({ objectMode: true, read: () => {} })
    const types = new Map()
    const meta = new Map()

    let header: Header
    let row: Row
    let index = 0

    if (opts.hasHeader) {
        rl.on("line", (line) => {
            const extract = rowExtractor(opts.separator)
            const values = extract(line)
            const storage = new Map()

            if (index === 0) {
                header = new Header(values)
                stream.emit("header", header)
            } else {
                row = new Row({ index: index - 1, values, header, types, meta, storage })
                stream.emit("row", row)
                stream.push({ index: index - 1, row, meta, opts })
            }
            index += 1
        })
    } else {
        rl.on("line", (line) => {
            const extract = rowExtractor(opts.separator)
            const values = extract(line)
            const storage = new Map()

            if (index === 0) {
                header = new Header(values.map((_, i) => i.toString()))
                stream.emit("header", header)
            }
            row = new Row({ index, values, header, types, meta, storage })
            stream.emit("row", row)
            stream.push({ index, row, meta, opts })
            index += 1
        })
    }

    rl.on("close", () => {
        stream.push(null)
        const [s, ns] = process.hrtime(start)
        const ms = s * 1e3 + Math.round(ns / 1e6)
        const data = { ms, rows: row.index + 1 }
        stream.emit("done", data)
        done?.(data)
    })

    return stream
}

export class CsvOptions {
    readonly hasHeader: boolean
    readonly separator: string

    constructor({ hasHeader, separator }: Partial<CsvOptions>) {
        /**
         * @type {boolean}
         */
        this.hasHeader = hasHeader != null ? hasHeader : false
        /**
         * @type {string}
         */
        this.separator = separator != null ? separator : ","
    }
}
