import { createInterface } from "readline"
import { Readable } from "stream"
import { createReadStream } from "fs"
import { rowExtractor } from "../../row-extractor"
import { Header } from "../../header"
import { Row } from "../../row"
import { DoneFn, MetaMap, TypesMap } from "../../types"
import { StreamData } from "../../stream-data"

/**
 * Read a csv file and convert rows to a stream of values.
 */
export const csv = (path: string, options: Partial<CsvOptions> = {}, done?: DoneFn): Readable => {
    const start = process.hrtime()
    const opts = new CsvOptions(options)
    const rl = createInterface({ input: createReadStream(path) })
    const rs = new Readable({ objectMode: true, read: () => {} })
    const types: TypesMap = new Map()
    const meta: MetaMap = new Map()

    let header: Header
    let row: Row
    let index = 0

    rl.on("line", (line) => {
        const extract = rowExtractor(opts.separator)
        const values = extract(line)
        const storage = new Map()

        if (index === 0) {
            if (opts.hasHeader) {
                header = new Header(values)
            } else {
                header = new Header(values.map((_, i) => i.toString()))
                row = new Row({ index: 0, values, header, types, meta, storage })
                const data: StreamData = { index: 0, row, meta, types }
                rs.push(data)
            }
        } else {
            const i = opts.hasHeader ? index - 1 : index
            row = new Row({ index: i, values, header, types, meta, storage })
            const data: StreamData = { index: i, row, meta, types }
            rs.push(data)
        }
        index += 1
    })

    rl.on("close", () => {
        rs.push(null)
        const [s, ns] = process.hrtime(start)
        const ms = s * 1e3 + Math.round(ns / 1e6)
        const data = { ms, rows: row.index + 1 }
        rs.emit("done", data)
        done?.(data)
    })

    return rs
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
