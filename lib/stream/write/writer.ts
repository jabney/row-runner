import { EOL } from "os"
import { Writable } from "stream"
import { Row } from "../../row"
import { StreamData } from "../../stream-data"
import { DoneFn } from "../../types"

type Closable = Writable & { close?: () => void }
export type WriteProjectFn = (row: Row) => any | Promise<any>

export class Writer extends Writable {
    constructor(stream?: Closable | null, transform?: WriteProjectFn | null, done?: DoneFn) {
        const start = process.hrtime()
        let rows = 0

        super({
            objectMode: true,

            write: async (data: StreamData, _, next) => {
                if (data.index === 0) {
                    this.emit("header", data.row.header)
                    stream?.write(data.row.header.columns + EOL)
                }
                this.emit("row", data.row)
                const value = (await transform?.(data.row)) ?? data.row
                stream?.write(value)
                next()
                rows = data.index + 1
            },
        })
        this.on("finish", () => {
            stream?.close?.()
            const [s, ns] = process.hrtime(start)
            const ms = s * 1e3 + Math.round(ns / 1e6)
            this.emit("done", { ms, rows })
            done?.({ ms, rows })
        })
    }
}
