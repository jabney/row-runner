import { Stream } from "stream"
import { Header } from "../../header"
import { Row } from "../../row"
import { StreamData } from "../../stream-data"
import { ColumnSpec } from "../../types"

export const exclude = (columns: ColumnSpec | ColumnSpec[]) => {
    let cols: Set<number>
    let header: Header
    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            if (data.index === 0) {
                cols = new Set(data.row.header.selectIndices(columns))
                header = new Header(data.row.header.columns.filter((_, i) => !cols.has(i)))
            }
            const values = data.row.values.filter((_, i) => !cols.has(i))
            const row = new Row({ ...data.row, values, header })
            next(null, { ...data, row })
        },
    })
}
