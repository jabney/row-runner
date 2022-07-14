import { Stream } from "stream"
import { StreamData } from "../../stream-data"
import { ColumnSpec, DataType } from "../../types"

export type DescribeItem = [col: ColumnSpec | ColumnSpec[], type: DataType]

export const describe = (desc: DescribeItem[]) => {
    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            if (data.index === 0) {
                desc.forEach(([spec, type]) => {
                    const cols = new Set(data.row.header.selectIndices(spec))
                    const columns = data.row.header.columns.filter((_, i) => cols.has(i))
                    columns.forEach((key) => data.row.types.set(key, type))
                })
            }
            next(null, data)
        },
    })
}
