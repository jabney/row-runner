export type Stringable = { toString(): string }

export type DoneFn = ((data: DoneData) => void) | null

export type ColumnSpec = string | number | RegExp

export interface SearchSpec {
    cols: "*" | ColumnSpec | ColumnSpec[]
    expr: string | RegExp
}

export interface SearchResult {
    column: string
    value: string
}

export interface DoneData {
    ms: number
    rows: number
}

export type DataType =
    | "string"
    | "number"
    | "parse-int"
    | "parse-float"
    | "boolean"
    | "nullable"
    | "json"
    | ((value: string) => any)

export type TypeDescriptor = [col: ColumnSpec | ColumnSpec[], type: DataType]

export type TypesMap = Map<string, DataType>

export type MetaMap = Map<string, any>

export type StorageMap = Map<string, any>
