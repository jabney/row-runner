import { Header } from "./lib/header"
import { Row } from "./lib/row"
import { StreamData as StreamDataClass } from "./lib/stream-data"

export * from "./lib/types"
export * from "./lib/stream"
export { Header } from "./lib/header"
export { Row } from "./lib/row"
export interface StreamData extends StreamDataClass {}

console.log(
    new Row({ index: 0, header: new Header([]), meta: new Map(), storage: new Map(), types: new Map(), values: [] })
)
