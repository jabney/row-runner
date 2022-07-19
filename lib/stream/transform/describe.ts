import { Stream } from "stream"
import { Row } from "../../row"
import { TypeDescriptor } from "../../types"

export const describe = (desc: TypeDescriptor | TypeDescriptor[]) => {
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
