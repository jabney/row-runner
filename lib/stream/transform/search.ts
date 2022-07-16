import { Stream } from "stream"
import { Row } from "../../row"
import { SearchResult, SearchSpec } from "../../types"

export type SearchFn = (row: Row, result: SearchResult[]) => void

export const search = (specs: SearchSpec | SearchSpec[], cb?: SearchFn) => {
    let index = 0
    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            const results = row.search(specs)
            if (results.length > 0) {
                cb?.(row, results)
                next(null, new Row({ ...row, index }))
                index += 1
            } else {
                next(null, null)
            }
        },
    })
}
