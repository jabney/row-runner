import { Stream } from "stream"
import { StreamData } from "../../stream-data"

export type ResultFn = (meta: any) => void

export const result = (handler: ResultFn) => {
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
            handler(meta)
        } else {
            handler({})
        }
    })
    return stream
}
