import { Stream } from "stream"
import { Header } from "../../header"
import { Row } from "../../row"
import { ColumnSpec } from "../../types"

export const exclude = (columns: ColumnSpec | ColumnSpec[]) => {
    let cols: Set<number>
    let header: Header
    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            if (row.index === 0) {
                cols = new Set(row.header.selectIndices(columns))
                header = new Header(row.header.columns.filter((_, i) => !cols.has(i)))
            }
            const values = row.values.filter((_, i) => !cols.has(i))
            next(null, new Row({ ...row, values, header }))
        },
    })
}
