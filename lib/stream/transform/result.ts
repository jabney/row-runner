import { Stream } from "stream"
import { Row } from "../../row"

export type ResultFn<T> = (meta: T) => void

export const result = <T = any>(handler: ResultFn<T>) => {
    let cachedRow: Row
    const stream = new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            cachedRow = row
            next(null, row)
        },
    }).on("close", () => {
        const meta = Object.fromEntries(cachedRow?.meta.entries() ?? []) as T
        handler(meta)
    })
    return stream
}
