import { Stream } from "stream"
import { Row } from "../../row"
import { StreamData } from "../../stream-data"
import { ColumnSpec, Stringable } from "../../types"

export type MapFn = (row: Row, value: string) => Stringable

export const map = (columns: ColumnSpec | ColumnSpec[], project: MapFn) => {
    let cols = new Set([0])
    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            if (data.index === 0) {
                cols = new Set(data.row.header.selectIndices(columns))
            }
            const values = data.row.values.map((v, i) =>
                cols.has(i) ? project(data.row, data.row.get(i)).toString() : v
            )
            const row = new Row({ ...data.row, values })
            next(null, { ...data, row })
        },
    })
}
