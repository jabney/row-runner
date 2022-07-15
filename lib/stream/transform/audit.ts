import { Stream } from "stream"
import { Row } from "../../row"
import { StreamData } from "../../stream-data"

export type AuditFn = (row: Row) => void

export const audit = (cb: AuditFn) => {
    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            cb(data.row)
            next(null, data)
        },
    })
}
