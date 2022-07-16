import { Stream } from "stream"
import { Row } from "../../row"

export type AuditFn = (row: Row) => void

export const audit = (cb: AuditFn) => {
    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            cb(row)
            next(null, row)
        },
    })
}
