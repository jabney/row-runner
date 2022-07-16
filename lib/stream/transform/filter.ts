import { Stream } from "stream"
import { Row } from "../../row"

export type FilterFn = (row: Row) => boolean

export const filter = (predicate: FilterFn) => {
    let index = 0
    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            if (predicate(row)) {
                next(null, new Row({ ...row, index }))
                index += 1
            } else {
                next(null, null)
            }
        },
    })
}
