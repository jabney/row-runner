import { Stream } from "stream"
import { Row } from "../../row"
import { StreamData } from "../../stream-data"

export type AggregateFn<T> = (row: Row, current: T) => T

export const aggregate = <T>(key: string, initial: T, setter: AggregateFn<T>) => {
    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            if (data.index === 0) {
                data.meta.set(key, initial)
            }
            data.meta.set(key, setter(data.row, data.meta.get(key)))
            next(null, data)
        },
    })
}
