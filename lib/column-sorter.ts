import { ColumnSpec } from "./types"

type IndicesFn = (columns: ColumnSpec) => number[]
type IndexObj = { index: number }

export const columnSorter = (order: ColumnSpec[], columnIndices: IndicesFn) => {
    const cols = order.map((v) => columnIndices(v)).flat()
    const columnOrder = new Map(cols.map((v, i) => [v, i]))

    const sort = (a: IndexObj, b: IndexObj) => {
        const _a = columnOrder.get(a.index) ?? Number.MAX_SAFE_INTEGER
        const _b = columnOrder.get(b.index) ?? Number.MAX_SAFE_INTEGER
        return _a - _b
    }

    return (columns: readonly string[]): string[] =>
        columns
            .map((value, index) => ({ index, value }))
            .sort(sort)
            .map(({ value }) => value)
}
