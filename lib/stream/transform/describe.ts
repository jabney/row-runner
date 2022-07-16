import { Stream } from "stream"
import { Row } from "../../row"
import { ColumnSpec, DataType } from "../../types"

export type DescribeItem = { cols: ColumnSpec | ColumnSpec[]; type: DataType }

export const describe = (desc: DescribeItem | DescribeItem[]) => {
    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            if (row.index === 0) {
                const descriptions = Array.isArray(desc) ? desc : [desc]
                descriptions.forEach(({ cols, type }) => {
                    const set = new Set(row.header.selectIndices(cols))
                    const columns = row.header.columns.filter((_, i) => set.has(i))
                    columns.forEach((key) => row.types.set(key, type))
                })
            }
            next(null, row)
        },
    })
}
