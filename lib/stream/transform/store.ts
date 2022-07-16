import { Stream } from "stream"
import { Row } from "../../row"

export type StoreFn<T> = (row: Row) => T

export const store = <T>(key: string, setter: StoreFn<T>) => {
    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            row.storage.set(key, setter(row))
            next(null, row)
        },
    })
}
