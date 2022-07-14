import { ColumnSpec } from "./types"

export class Header {
    readonly columns: readonly string[]

    private _indexLookup: Record<string, number> | null = null
    private _nameLookup: Record<number, string> | null = null

    constructor(columns: readonly string[]) {
        this.columns = columns
    }

    get indexLookup(): Record<string, number> {
        if (this._indexLookup == null) {
            this._indexLookup = Object.fromEntries(this.columns.map((v, i) => [v, i]))
        }
        return this._indexLookup
    }

    get nameLookup(): Record<number, string> {
        if (this._nameLookup == null) {
            this._nameLookup = Object.fromEntries(this.columns.map((v, i) => [i, v]))
        }
        return this._nameLookup
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

    getName = (index: number): string => this.nameLookup[index]
}
