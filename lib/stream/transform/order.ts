import { Stream } from "stream"
import { columnSorter } from "../../column-sorter"
import { Header } from "../../header"
import { Row } from "../../row"
import { ColumnSpec } from "../../types"

export const order = (columns: ColumnSpec[]) => {
    let header: Header
    let sort = columnSorter(columns, () => [0])

    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            if (row.index === 0) {
                sort = columnSorter(columns, row.header.selectIndices)
                header = new Header(sort(row.header.columns))
            }
            next(null, new Row({ ...row, values: sort(row.values), header }))
        },
    })
}
