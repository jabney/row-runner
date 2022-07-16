import { EOL } from "os"
import { Writable } from "stream"
import { Row } from "../../row"
import { DoneFn } from "../../types"

type Closable = Writable & { close?: () => void }
export type WriteProjectFn = (row: Row) => any | Promise<any>

export class Writer extends Writable {
    constructor(stream?: Closable | null, transform?: WriteProjectFn | null, done?: DoneFn) {
        const start = process.hrtime()
        let rows = 0

        super({
            objectMode: true,
            write: async (row: Row, _, next) => {
                if (row.index === 0) {
                    stream?.write(row.header.columns + EOL)
                }
                const value = (await transform?.(row)) ?? row
                stream?.write(value)
                next()
                rows = row.index + 1
            },
        })
        this.on("finish", () => {
            stream?.close?.()
            const [s, ns] = process.hrtime(start)
            const ms = s * 1e3 + Math.round(ns / 1e6)
            done?.({ ms, rows })
        })
    }
}
