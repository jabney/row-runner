import { Stream } from "stream"
import { Header } from "../../header"
import { Row } from "../../row"
import { StreamData } from "../../stream-data"

type ListType = [string | number, string]

export const rename = (list: ListType[]) => {
    let header: Header
    const map = new Map(list.map(([key, value]) => (typeof key === "number" ? [key.toString(), value] : [key, value])))

    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            if (data.index === 0) {
                header = new Header(data.row.header.columns.map((v) => map.get(v) || v))
            }
            const row = new Row({ ...data.row, header })
            next(null, { ...data, row })
        },
    })
}
