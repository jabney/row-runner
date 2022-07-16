import { Stream } from "stream"
import { Row } from "../../row"

export type AggregateFn<T> = (row: Row, current: T) => T

export const aggregate = <T>(key: string, initial: T, setter: AggregateFn<T>) => {
    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            if (row.index === 0) {
                row.meta.set(key, initial)
            }
            row.meta.set(key, setter(row, row.meta.get(key)))
            next(null, row)
        },
    })
}
