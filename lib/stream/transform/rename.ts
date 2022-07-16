import { Stream } from "stream"
import { Header } from "../../header"
import { Row } from "../../row"

type ListType = [string | number, string]

export const rename = (list: ListType[]) => {
    let header: Header
    const map = new Map(list.map(([key, value]) => (typeof key === "number" ? [key.toString(), value] : [key, value])))

    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            if (row.index === 0) {
                header = new Header(row.header.columns.map((v) => map.get(v) || v))
            }
            next(null, new Row({ ...row, header }))
        },
    })
}
