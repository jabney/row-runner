import { Stream } from "stream"
import { Header } from "../../header"
import { Row } from "../../row"
import { Stringable } from "../../types"

export type AppendFn = (row: Row) => Stringable

export const append = (name: string | null, valueFn: AppendFn) => {
    let header: Header
    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            if (row.index === 0) {
                const _name = name == null ? row.values.length.toString() : name
                header = new Header([...row.header.columns, _name])
            }
            const values = [...row.values, valueFn(row).toString()]
            next(null, new Row({ ...row, values, header }))
        },
    })
}
