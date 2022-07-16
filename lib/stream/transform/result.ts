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
        if (cachedRow) {
            const meta = Object.fromEntries(cachedRow == null ? [] : [...cachedRow.meta.entries()])
            handler(meta as T)
        } else {
            handler({} as T)
        }
    })
    return stream
}
