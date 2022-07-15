import tap from "tap"
import { csv, each, filter, run } from "../index"
import { createInterface } from "readline"
import { createReadStream } from "fs"

const realEstatePath = "./test/data/real-estate.csv"

const realEstateLines = new Promise<number>((resolve) => {
    let count = 0
    const rl = createInterface({ input: createReadStream(realEstatePath) })
    rl.on("line", () => (count += 1))
    rl.on("close", () => resolve(count - 1))
})

tap.test("Reports processed row count", async (t) => {
    const lines = await realEstateLines

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
    const lines = await realEstateLines

    const rows = await new Promise<number>((resolve) => {
        let count = 0
        csv(realEstatePath, { hasHeader: true })
            .pipe(
                filter((row) => {
                    return row.index % 2 === 0
                })
            )
            .pipe(
                each(
                    () => (count += 1),
                    () => resolve(count)
                )
            )
    })

    t.equal(rows, Math.ceil(lines / 2))
})
