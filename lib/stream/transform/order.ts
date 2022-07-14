import { Stream } from "stream"
import { columnSorter } from "../../column-sorter"
import { Header } from "../../header"
import { Row } from "../../row"
import { StreamData } from "../../stream-data"
import { ColumnSpec } from "../../types"

export const order = (columns: ColumnSpec[]) => {
    let header: Header
    let sort = columnSorter(columns, () => [0])

    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            if (data.index === 0) {
                sort = columnSorter(columns, data.row.header.selectIndices)
                header = new Header(sort(data.row.header.columns))
            }
            const row = new Row({ ...data.row, values: sort(data.row.values), header })
            next(null, { ...data, row })
        },
    })
}
