import { Stream } from "stream"
import { StreamData } from "../../stream-data"

export type ResultFn<T> = (meta: T) => void

export const result = <T = any>(handler: ResultFn<T>) => {
    let streamData: StreamData
    const stream = new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            streamData = data
            next(null, data)
        },
    }).on("close", () => {
        if (streamData) {
            const meta = Object.fromEntries(streamData == null ? [] : [...streamData.meta.entries()])
            handler(meta as T)
        } else {
            handler({} as T)
        }
    })
    return stream
}
