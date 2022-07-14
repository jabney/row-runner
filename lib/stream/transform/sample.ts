import { Stream } from "stream"
import { Row } from "../../row"
import { StreamData } from "../../stream-data"
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
        transform: (data: StreamData, _, next) => {
            const f = typeof frequency === "function" ? frequency(data.row) : frequency
            if (rng.value < f) {
                const row = new Row({ ...data.row, index })
                next(null, { ...data, index, row })
                index += 1
            } else {
                next(null, null)
            }
        },
    })
}
