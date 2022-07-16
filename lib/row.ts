import { Header } from "./header"
import { ColumnSpec, MetaMap, SearchResult, SearchSpec, StorageMap, TypesMap } from "./types"

type RowData = Pick<Row, "index" | "values" | "header" | "types" | "meta" | "storage">

export class Row {
    readonly index: number
    readonly values: readonly string[]
    readonly header: Header
    readonly types: TypesMap
    readonly meta: MetaMap
    readonly storage: StorageMap

    constructor(row: RowData) {
        this.index = row.index
        this.values = row.values
        this.header = row.header
        this.types = row.types
        this.meta = row.meta
        this.storage = row.storage
    }

    get = (column: string | number): string => {
        return typeof column === "number" ? this.values[column] : this.values[this.header.getIndex(column)]
    }

    getTyped = <T = unknown>(column: string | number): T => {
        return this.convertType(
            column,
            typeof column === "number" ? this.values[column] : this.values[this.header.getIndex(column)]
        )
    }

    select = (columns: ColumnSpec | ColumnSpec[]): string[] => {
        const cols = new Set(this.header.selectIndices(columns))
        return this.values.filter((_, i) => cols.has(i))
    }

    search = (specs: SearchSpec | SearchSpec[]): SearchResult[] => {
        const list: SearchResult[][] = []
        for (const spec of Array.isArray(specs) ? specs : [specs]) {
            const result = find(this.values, spec, this.header)
            list.push(result)
        }
        return list.flat()
    }

    asObject(columns?: ColumnSpec | ColumnSpec[]): Record<string, any> {
        let [cols, vals] = (() => {
            if (columns != null) {
                const set = new Set(this.header.selectIndices(columns))
                return [this.header.columns.filter((_, i) => set.has(i)), this.values.filter((_, i) => set.has(i))]
            } else {
                return [this.header.columns, this.values]
            }
        })()

        return Object.fromEntries(cols.map((col, i) => [col, this.convertType(col, vals[i])]))
    }

    toJSON() {
        return JSON.stringify(this.asObject())
    }

    private convertType = (col: string | number, value: string): any => {
        const type = this.types.get(typeof col === "string" ? col : this.header.columns[col])
        switch (type) {
            case "number":
                return Number(value)
            case "parse-int":
                return parseInt(value)
            case "parse-float":
                return parseFloat(value)
            case "boolean":
                return value.trim().toLowerCase() === "true"
            case "date":
                return new Date(value)
            case "nullable":
                return value.length === 0 ? null : value
            case "json":
                try {
                    return JSON.parse(value)
                } catch {
                    return null
                }
            default:
                if (typeof type === "function") {
                    return type(value)
                }
                return value
        }
    }
}

const find = (row: readonly string[], spec: SearchSpec, header: Header): SearchResult[] => {
    const withColumnIndex = row.map((value, i) => ({ column: header.columns[i], value }))
    const cols = spec.cols === "*" ? new Set() : new Set(header.selectIndices(spec.cols))
    const values = spec.cols === "*" ? withColumnIndex : withColumnIndex.filter((_, i) => cols.has(i))
    const expr = typeof spec.expr === "string" ? new RegExp(spec.expr, "i") : spec.expr
    return values.filter(({ value }) => expr.test(value))
}
