import { pipeline } from "stream"
import { audit } from "../lib/stream/transform/audit"
import { csv } from "../lib/stream/read/csv"
import { select } from "../lib/stream/transform/select"
import { write } from "../lib/stream/write/write"
import { aggregate } from "../lib/stream/transform/aggregate"
import { result } from "../lib/stream/transform/result"
import { report } from "../lib/stream/transform/report"
import { run } from "../lib/stream/write/run"
import { filter } from "../lib/stream/transform/filter"
import { describe } from "../lib/stream/transform/describe"
;(() => {
    const table: any[] = []

    pipeline(
        csv("real-estate.csv", { hasHeader: true }),
        audit((row) => table.push(row.asObject())),
        run(),
        () => console.table(table)
    )
    /*
    ┌──────────────────┬─────────┬───────┬──────┬───────┬────────┬─────────┐
    │       city       │   zip   │ state │ beds │ baths │ sq_ft  │  price  │
    ├──────────────────┼─────────┼───────┼──────┼───────┼────────┼─────────┤
    │   'SACRAMENTO'   │ '95824' │ 'CA'  │ '2'  │  '1'  │ '797'  │ '81900' │
    │   'SACRAMENTO'   │ '95841' │ 'CA'  │ '3'  │  '1'  │ '1122' │ '89921' │
    │   'SACRAMENTO'   │ '95842' │ 'CA'  │ '3'  │  '2'  │ '1104' │ '90895' │
    │   'SACRAMENTO'   │ '95820' │ 'CA'  │ '3'  │  '1'  │ '1177' │ '91002' │
    │ 'RANCHO CORDOVA' │ '95670' │ 'CA'  │ '2'  │  '2'  │ '941'  │ '94905' │
    └──────────────────┴─────────┴───────┴──────┴───────┴────────┴─────────┘
    */
})()

//
;(async () => {
    const table: any[] = []

    pipeline(
        csv("real-estate.csv", { hasHeader: true }),
        select(["beds", "baths", "sq_ft", "price"]),
        audit((row) => table.push(row.asObject())),
        write("example1a.csv"),
        () => console.table(table)
    )

    csv("real-estate.csv", { hasHeader: true })
        .pipe(select(["beds", "baths", "sq_ft", "price"]))
        .pipe(filter((row) => +row.get("sq_ft") > 1000))
        .pipe(write("example1b.csv"))

    await new Promise((resolve) => {
        csv("real-estate.csv", { hasHeader: true })
            .pipe(select(["beds", "baths", "sq_ft", "price"]))
            .pipe(filter((row) => +row.get("sq_ft") > 1000))
            .pipe(write("example1c.csv", resolve))
    })

    /*
    ┌──────┬───────┬────────┬─────────┐
    │ beds │ baths │ sq_ft  │  price  │
    ├──────┼───────┼────────┼─────────┤
    │ '2'  │  '1'  │ '797'  │ '81900' │
    │ '3'  │  '1'  │ '1122' │ '89921' │
    │ '3'  │  '2'  │ '1104' │ '90895' │
    │ '3'  │  '1'  │ '1177' │ '91002' │
    │ '2'  │  '2'  │ '941'  │ '94905' │
    └──────┴───────┴────────┴─────────┘
    */
})()

//
;(() => {
    const table: any[] = []

    pipeline(
        csv("real-estate.csv", { hasHeader: true }),
        select(["beds", "baths", "sq_ft", "price"]),
        filter((row) => +row.get("sq_ft") > 1000),
        audit((row) => table.push(row.asObject())),
        write("example1.csv"),
        () => console.table(table)
    )

    /*
    ┌──────┬───────┬────────┬─────────┐
    │ beds │ baths │ sq_ft  │  price  │
    ├──────┼───────┼────────┼─────────┤
    │ '3'  │  '1'  │ '1122' │ '89921' │
    │ '3'  │  '2'  │ '1104' │ '90895' │
    │ '3'  │  '1'  │ '1177' │ '91002' │
    └──────┴───────┴────────┴─────────┘
    */
})()

//
;(() => {
    pipeline(
        csv("real-estate.csv", { hasHeader: true }),
        describe([{ cols: "price", type: "number" }]),
        aggregate("count", 0, (_, count) => count + 1),
        aggregate("total", 0, (row, total) => total + row.getTyped<number>("price")),
        result<{ count: number; total: number }>(({ count, total }) => {
            console.table([{ count, total: `$${total.toLocaleString()}` }])
        }),
        report<{ count: number; total: number }>("example3.csv", ({ count, total }) => [
            ["count", "total"],
            [count, `$${total.toLocaleString()}`],
        ]),
        run(),
        () => {}
    )

    /*
    ┌───────┬────────────┐
    │ count │   total    │
    ├───────┼────────────┤
    │   5   │ '$448,623' │
    └───────┴────────────┘
    */
})()
