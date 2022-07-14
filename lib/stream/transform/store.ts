import { Stream } from "stream"
import { Row } from "../../row"
import { StreamData } from "../../stream-data"

export type StoreFn<T> = (row: Row) => T

export const store = <T>(key: string, setter: StoreFn<T>) => {
    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            data.row.storage.set(key, setter(data.row))
            next(null, data)
        },
    })
}
