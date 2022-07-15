import tap from "tap"
import { createInterface } from "readline"
import { createReadStream } from "fs"
import {
    aggregate,
    append,
    audit,
    csv,
    each,
    exclude,
    filter,
    map,
    order,
    rename,
    result,
    run,
    sample,
    select,
    store,
} from ".."
const realEstatePath = "./test/data/real-estate.csv"

const realEstateLineCount = new Promise<number>((resolve) => {
    let count = 0
    const rl = createInterface({ input: createReadStream(realEstatePath) })
    rl.on("line", () => (count += 1))
    rl.on("close", () => resolve(count - 1))
})

tap.test("Reports processed row count", async (t) => {
    const lines = await realEstateLineCount

    const reported = await new Promise<number>((resolve) => {
        csv(realEstatePath, { hasHeader: true }, (data) => resolve(data.rows)).pipe(run())
    })

    const counted = await new Promise<number>((resolve) => {
        let rows = 0
        csv(realEstatePath, { hasHeader: true }).pipe(
            each(
                () => (rows += 1),
                () => resolve(rows)
            )
        )
    })

    t.equal(reported, lines)
    t.equal(counted, lines)
})

tap.test("Filters rows", async (t) => {
    const lines = await realEstateLineCount

    const rows = await new Promise<number>((resolve) => {
        csv(realEstatePath, { hasHeader: true })
            .pipe(filter((row) => row.index % 2 === 0))
            .pipe(aggregate("count", 0, (row, count) => count + 1))
            .pipe(result<{ count: number }>(({ count }) => resolve(count)))
            .pipe(run())
    })

    t.equal(rows, Math.ceil(lines / 2))
})

tap.test("Samples rows", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(sample(0, 0.1))
        .pipe(aggregate("count", 0, (row, count) => count + 1))
        .pipe(
            result<{ count: number }>(({ count }) => {
                t.equal(count, 101)
                t.end()
            })
        )
        .pipe(run())
})

tap.test("Selects columns", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(filter((row) => row.index === 0))
        .pipe(select(["beds", "baths", "sq_ft", "price"]))
        .pipe(
            audit((row) => {
                t.equal(row.header.getIndex("beds"), 0)
                t.equal(row.header.getIndex("baths"), 1)
                t.equal(row.header.getIndex("sq_ft"), 2)
                t.equal(row.header.getIndex("price"), 3)
                t.equal(row.header.getIndex("type"), undefined)
            })
        )
        .pipe(run(() => t.end()))
})

tap.test("Excludes columns", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(filter((row) => row.index === 0))
        .pipe(exclude(["street", "city", "zip", "state"]))
        .pipe(
            audit((row) => {
                t.equal(row.header.getIndex("street"), undefined)
                t.equal(row.header.getIndex("city"), undefined)
                t.equal(row.header.getIndex("zip"), undefined)
                t.equal(row.header.getIndex("state"), undefined)
            })
        )
        .pipe(run(() => t.end()))
})

tap.test("Orders columns", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(filter((row) => row.index === 0))
        .pipe(select(["beds", "baths", "sq_ft", "price"]))
        .pipe(order(["sq_ft", "price"]))
        .pipe(
            audit((row) => {
                t.equal(row.header.getIndex("sq_ft"), 0)
                t.equal(row.header.getIndex("price"), 1)
                t.equal(row.header.getIndex("beds"), 2)
                t.equal(row.header.getIndex("baths"), 3)
            })
        )
        .pipe(run(() => t.end()))
})

tap.test("Renames columns", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(filter((row) => row.index === 0))
        .pipe(select(["beds", "baths", "sq_ft", "price"]))
        .pipe(rename([["sq_ft", "square feet"]]))
        .pipe(
            audit((row) => {
                t.equal(row.header.getIndex("beds"), 0)
                t.equal(row.header.getIndex("baths"), 1)
                t.equal(row.header.getIndex("square feet"), 2)
                t.equal(row.header.getIndex("price"), 3)
                t.equal(row.header.getIndex("sq_ft"), undefined)
            })
        )
        .pipe(run(() => t.end()))
})

tap.test("Maps columns", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(filter((row) => row.index < 5))
        .pipe(store("price", (row) => row.get("price")))
        .pipe(map("price", (row, value) => Number(value).toLocaleString()))
        .pipe(
            audit((row) => {
                const price = row.get("price")
                const storedPrice = row.storage.get("price")
                t.not(price, storedPrice)
                t.match(price, /^\d+,\d+$/)
            })
        )
        .pipe(run(() => t.end()))
})

tap.test("Appends columns", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(filter((row) => row.index < 50 && ["95621", "95673"].includes(row.get("zip"))))
        .pipe(append("local", (row) => row.get("zip") === "95673"))
        .pipe(audit((row) => t.equal(row.get("zip") === "95673", row.get("local") === "true")))
        .pipe(run(() => t.end()))
})
