import { Stream } from "stream"
import { StreamData } from "../../stream-data"

export type ConstantFn<T> = () => T

export const constant = <T>(key: string, value: ConstantFn<T>) => {
    return new Stream.Transform({
        objectMode: true,
        transform: (data: StreamData, _, next) => {
            if (data.index === 0) {
                data.meta.set(key, value())
            }
            next(null, data)
        },
    })
}
