import { ColumnSpec } from "./types"

export class Header {
    readonly columns: readonly string[]

    private _indices: Map<string, number>

    constructor(columns: readonly string[]) {
        this.columns = columns
        this._indices = new Map(this.columns.map((v, i) => [v, i]))
    }

    selectIndices = (columns: ColumnSpec | ColumnSpec[]): number[] => {
        return (Array.isArray(columns) ? columns : [columns])
            .map((v) => {
                if (v instanceof RegExp) {
                    return [...this._indices].filter(([key]) => v.test(key)).map(([, value]) => value)
                } else if (typeof v === "string") {
                    return this.getIndex(v)
                } else if (typeof v === "number") {
                    return v
                } else {
                    return -1
                }
            })
            .flat()
    }

    getIndex = (column: string): number => this._indices.get(column) ?? -1
}
