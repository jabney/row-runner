import { Stream } from "stream"
import { Row } from "../../row"

export type ConstantFn<T> = () => T

export const constant = <T>(key: string, value: ConstantFn<T>) => {
    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            if (row.index === 0) {
                row.meta.set(key, value())
            }
            next(null, row)
        },
    })
}
