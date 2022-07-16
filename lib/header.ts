import { ColumnSpec } from "./types"

export class Header {
    readonly columns: readonly string[]

    private _indices: Map<string, number> | null = null

    constructor(columns: readonly string[]) {
        this.columns = columns
    }

    private get indices() {
        if (this._indices == null) {
            this._indices = new Map(this.columns.map((v, i) => [v, i]))
        }
        return this._indices
    }

    selectIndices = (columns: ColumnSpec | ColumnSpec[]): number[] => {
        return (Array.isArray(columns) ? columns : [columns])
            .map((v) => {
                if (v instanceof RegExp) {
                    return [...this.indices].filter(([key]) => v.test(key)).map(([, value]) => value)
                } else if (typeof v === "number") {
                    return v
                } else {
                    return this.getIndex(v.toString?.() ?? -1)
                }
            })
            .flat()
    }

    getIndex = (column: string): number => this.indices.get(column) ?? -1
}
