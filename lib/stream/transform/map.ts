import { Stream } from "stream"
import { Row } from "../../row"
import { ColumnSpec, Stringable } from "../../types"

export type MapFn = (row: Row, value: string) => Stringable

export const map = (columns: ColumnSpec | ColumnSpec[], project: MapFn) => {
    let cols = new Set([0])
    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            if (row.index === 0) {
                cols = new Set(row.header.selectIndices(columns))
            }
            const values = row.values.map((v, i) => (cols.has(i) ? project(row, row.values[i]).toString() : v))
            next(null, new Row({ ...row, values }))
        },
    })
}
