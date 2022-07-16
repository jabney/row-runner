import { Stream } from "stream"
import { Row } from "../../row"
import createRng from "seedable"

/**
 * Return a freqency to be tested against the RNG.
 */
export type SampleFn = (row: Row) => number

export const sample = (seed: number, frequency: number | SampleFn) => {
    const rng = createRng(seed)
    let index = 0
    return new Stream.Transform({
        objectMode: true,
        transform: (row: Row, _, next) => {
            const f = typeof frequency === "function" ? frequency(row) : frequency
            if (rng.value < f) {
                next(null, new Row({ ...row, index }))
                index += 1
            } else {
                next(null, null)
            }
        },
    })
}
