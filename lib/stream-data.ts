import { Row } from "./row"
import { DataType } from "./types"

export class StreamData {
    readonly index: number
    readonly row: Row
    readonly meta: Map<string, any>
    readonly types: Map<string, DataType>

    constructor(data: StreamData) {
        this.index = data.index
        this.row = data.row
        this.meta = data.meta
        this.types = data.types
    }
}
