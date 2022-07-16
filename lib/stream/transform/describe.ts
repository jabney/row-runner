import { Stream } from "stream"
import { StreamData } from "../../stream-data"
import { ColumnSpec, DataType } from "../../types"

export type DescribeItem = { cols: ColumnSpec | ColumnSpec[]; type: DataType }

export const describe = (desc: DescribeItem | DescribeItem[]) => {
    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            if (data.index === 0) {
                const descriptions = Array.isArray(desc) ? desc : [desc]
                descriptions.forEach(({ cols, type }) => {
                    const set = new Set(data.row.header.selectIndices(cols))
                    const columns = data.row.header.columns.filter((_, i) => set.has(i))
                    columns.forEach((key) => data.row.types.set(key, type))
                })
            }
            next(null, data)
        },
    })
}
