import { Stream } from "stream"
import { Row } from "../../row"
import { StreamData } from "../../stream-data"
import { SearchResult, SearchSpec } from "../../types"

export type SearchFn = (row: Row, result: SearchResult[]) => void

export const search = (specs: SearchSpec | SearchSpec[], cb?: SearchFn) => {
    let index = 0
    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            const results = data.row.search(specs)
            if (results.length > 0) {
                const row = new Row({ ...data.row, index })
                cb?.(row, results)
                next(null, { ...data, index, row })
                index += 1
            } else {
                next(null, null)
            }
        },
    })
}
