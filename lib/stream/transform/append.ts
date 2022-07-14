import { Stream } from "stream"
import { Header } from "../../header"
import { Row } from "../../row"
import { StreamData } from "../../stream-data"
import { Stringable } from "../../types"

export type AppendFn = (row: Row) => Stringable

export const append = (name: string | null, valueFn: AppendFn) => {
    let header: Header
    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            if (data.index === 0) {
                const _name = name == null ? data.row.values.length.toString() : name
                header = new Header([...data.row.header.columns, _name])
            }
            const values = [...data.row.values, valueFn(data.row).toString()]
            const row = new Row({ ...data.row, values, header })
            next(null, { ...data, row })
        },
    })
}
