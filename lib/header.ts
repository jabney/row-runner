import { ColumnSpec } from "./types"

export class Header {
    readonly columns: readonly string[]

    private _indexLookup: Record<string, number> | null = null

    constructor(columns: readonly string[]) {
        this.columns = columns
    }

    get indexLookup(): Record<string, number> {
        if (this._indexLookup == null) {
            this._indexLookup = Object.fromEntries(this.columns.map((v, i) => [v, i]))
        }
        return this._indexLookup
    }

    selectIndices = (columns: ColumnSpec | ColumnSpec[]): number[] => {
        return (Array.isArray(columns) ? columns : [columns])
            .map((v) => {
                if (v instanceof RegExp) {
                    return Object.entries(this.indexLookup)
                        .filter(([key]) => v.test(key))
                        .map(([, value]) => value)
                } else if (typeof v === "string") {
                    return this.indexLookup[v]
                } else if (typeof v === "number") {
                    return v
                } else {
                    return -1
                }
            })
            .flat()
    }

    getIndex = (column: string): number => this.indexLookup[column]
}
