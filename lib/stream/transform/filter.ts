import { Stream } from "stream"
import { Row } from "../../row"
import { StreamData } from "../../stream-data"

export type FilterFn = (row: Row) => boolean

export const filter = (predicate: FilterFn) => {
    let index = 0
    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            if (predicate(data.row)) {
                const row = new Row({ ...data.row, index })
                next(null, { ...data, index, row })
                index += 1
            } else {
                next(null, null)
            }
        },
    })
}
