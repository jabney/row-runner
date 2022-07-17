import tap from "tap"
import { createInterface } from "readline"
import { createReadStream } from "fs"
import { mkdir, rm } from "fs/promises"
import { csv } from "../lib/stream/read/csv"
import { aggregate } from "../lib/stream/transform/aggregate"
import { append } from "../lib/stream/transform/append"
import { audit } from "../lib/stream/transform/audit"
import { constant } from "../lib/stream/transform/constant"
import { describe } from "../lib/stream/transform/describe"
import { exclude } from "../lib/stream/transform/exclude"
import { filter } from "../lib/stream/transform/filter"
import { map } from "../lib/stream/transform/map"
import { order } from "../lib/stream/transform/order"
import { rename } from "../lib/stream/transform/rename"
import { report } from "../lib/stream/transform/report"
import { result } from "../lib/stream/transform/result"
import { sample } from "../lib/stream/transform/sample"
import { search } from "../lib/stream/transform/search"
import { select } from "../lib/stream/transform/select"
import { store } from "../lib/stream/transform/store"
import { each } from "../lib/stream/write/each"
import { print } from "../lib/stream/write/print"
import { run } from "../lib/stream/write/run"
import { write } from "../lib/stream/write/write"

import { pipeline } from "stream"

const realEstatePath = "./test/data/real-estate.csv"
const crimeReportsPath = "./test/data/crime-reports.csv"
const noHeaderPath = "./test/data/no-header.csv"

const realEstateLineCount = new Promise<number>((resolve) => {
    let count = 0
    const rl = createInterface({ input: createReadStream(realEstatePath) })
    rl.on("line", () => (count += 1))
    rl.on("close", () => resolve(count - 1))
})

const makeTempDir = mkdir("temp").catch(() => {})

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
            .pipe(result(({ count }) => resolve(count)))
            .pipe(run())
    })

    t.equal(rows, Math.ceil(lines / 2))
})

tap.test("Samples rows", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(sample(0, 0.1))
        .pipe(aggregate("count", 0, (row, count) => count + 1))
        .pipe(
            result(({ count }) => {
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
                t.equal(row.header.getIndex("type"), -1)
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
                t.equal(row.header.getIndex("street"), -1)
                t.equal(row.header.getIndex("city"), -1)
                t.equal(row.header.getIndex("zip"), -1)
                t.equal(row.header.getIndex("state"), -1)
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
                t.equal(row.header.getIndex("sq_ft"), -1)
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
        .pipe(constant("zips", () => new Set(["95621", "95673"])))
        .pipe(filter((row) => row.index < 50 && row.meta.get("zips").has(row.get("zip"))))
        .pipe(append("local", (row) => row.get("zip") === "95673"))
        .pipe(audit((row) => t.equal(row.get("zip") === "95673", row.get("local") === "true")))
        .pipe(run(() => t.end()))
})

tap.test("Searches rows", (t) => {
    csv(crimeReportsPath, { hasHeader: true })
        .pipe(filter((row) => row.index < 100))
        .pipe(search([{ cols: "crime_desc", expr: /burglary|theft/i }]))
        .pipe(audit((row) => t.match(row.get("crime_desc"), /burglary|theft/i)))
        .pipe(
            run(({ rows }) => {
                t.equal(rows, 28)
                t.end()
            })
        )
})

tap.test("Describes types", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(
            describe([
                { cols: ["latitude", "longitude"], type: "number" },
                { cols: "price", type: (value) => `$${Number(value).toLocaleString()}` },
            ])
        )
        .pipe(filter((row) => row.index < 3))
        .pipe(
            audit((row) => {
                t.type(row.getTyped("latitude"), "number")
                t.type(row.getTyped("longitude"), "number")
                t.type(row.getTyped("price"), "string")
                t.match(row.getTyped("price"), /^\$\d+,\d+$/)
            })
        )
        .pipe(run(() => t.end()))
})

tap.test("Converts row to object", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(
            describe([
                { cols: ["beds", "baths", "sq_ft", "price"], type: "number" },
                { cols: ["latitude", "longitude"], type: "json" },
                { cols: "sale_date", type: "date" },
            ])
        )
        .pipe(filter((row) => row.index < 3))
        .pipe(
            audit((row) => {
                const full = row.asObject()
                t.type(full.beds, "number")
                t.type(full.baths, "number")
                t.type(full.sq_ft, "number")
                t.type(full.price, "number")
                t.type(full.latitude, "number")
                t.type(full.longitude, "number")
                t.ok(full.sale_date instanceof Date)

                const partial = row.asObject(/beds|baths|sale_date/)
                t.type(partial.beds, "number")
                t.type(partial.baths, "number")
                t.ok(partial.sale_date instanceof Date)
            })
        )
        .pipe(run(() => t.end()))
})

tap.test("Processes no-header CSV", (t) => {
    const cols = new Map([
        ["beds", 4],
        ["baths", 5],
        ["sq_ft", 6],
        ["price", 9],
    ])

    csv(noHeaderPath, { hasHeader: false })
        .pipe(select([...cols.values()]))
        .pipe(describe({ cols: [0, 1], type: "number" }))
        .pipe(
            describe([
                { cols: [2], type: "json" },
                { cols: [3], type: "json" },
            ])
        )
        .pipe(filter((row) => row.index === 0))
        .pipe(
            audit((row) => {
                t.type(row.get(0), "string")
                t.type(row.get(1), "string")
                t.type(row.get(2), "string")
                t.type(row.get(3), "string")
                t.type(row.getTyped(0), "number")
                t.type(row.getTyped(1), "number")
                t.type(row.getTyped(2), "number")
                t.type(row.getTyped(3), "number")
            })
        )
        .pipe(
            audit((row) => {
                const obj = row.asObject()
                t.equal(Object.keys(obj).length, 4)
                t.ok(obj["4"] != null)
                t.ok(obj["5"] != null)
                t.ok(obj["5"] != null)
                t.ok(obj["9"] != null)
            })
        )
        .pipe(run(() => t.end()))
})

tap.test("Selects columns from a row", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(filter((row) => row.index === 0))
        .pipe(
            audit((row) => {
                const [beds, baths] = row.select(["beds", "baths"])
                t.same(beds, 2)
                t.same(baths, 1)
            })
        )
        .pipe(run(() => t.end()))
})

tap.test("Converts rows to json", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(filter((row) => row.index === 0))
        .pipe(select(["beds", "baths"]))
        .pipe(
            audit((row) => {
                const json = JSON.stringify(row)
                t.equal(json, `"{\\"beds\\":\\"2\\",\\"baths\\":\\"1\\"}"`)
            })
        )
        .pipe(run(() => t.end()))
})

tap.test("Converts types pickup", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(
            describe([
                { cols: "beds", type: "parse-int" },
                { cols: "price", type: "parse-float" },
                { cols: "extra1", type: "boolean" },
                { cols: "extra2", type: "nullable" },
                { cols: "extra3", type: "json" },
            ])
        )
        .pipe(filter((row) => row.index === 0))
        .pipe(select(["beds", "baths", "price", "extra1", "extra2", "extra3"]))
        .pipe(
            audit((row) => {
                const obj = row.asObject()
                t.type(obj.beds, "number")
                t.type(obj.price, "number")
                t.equal(obj.extra1, true)
                t.equal(obj.extra2, null)
                t.equal(obj.extra3, null)
            })
        )
        .pipe(run(() => t.end()))
})

tap.test("Header.selectIndices returns -1 for unknown column type", (t) => {
    csv(realEstatePath, { hasHeader: true })
        .pipe(filter((row) => row.index === 0))
        .pipe(
            audit((row) => {
                const [index] = row.header.selectIndices(new Date() as any)
                t.equal(index, -1)
            })
        )
        .pipe(run(() => t.end()))
})

tap.test("Wites aggregation report", async (t) => {
    const reportFilePath = "temp/real-estate-report.csv"
    await makeTempDir
    await rm(reportFilePath, { force: true })

    await new Promise((resolve) => {
        pipeline(
            csv(realEstatePath, { hasHeader: true }),
            describe({ cols: "price", type: "number" }),
            filter((row) => row.index < 25),
            aggregate("count", 0, (_, count) => count + 1),
            aggregate("total", 0, (row, total) => total + row.getTyped<number>("price")),
            report<{ count: number; total: number }>(reportFilePath, ({ count, total }) => [
                ["count", "total"],
                [count, total],
            ]),
            run(),
            resolve
        )
    })

    await new Promise((resolve) => {
        pipeline(
            csv(reportFilePath, { hasHeader: true }),
            audit((row) => {
                const [count, total] = row.select(["count", "total"])
                t.same(count, 25)
                t.ok(+total > 2e6)
            }),
            run(),
            resolve
        )
    })
})

tap.test("Wites csv", async (t) => {
    const writeFilePath = "temp/write.csv"
    await makeTempDir
    await rm(writeFilePath, { force: true })

    await new Promise((resolve) => {
        pipeline(
            csv(realEstatePath, { hasHeader: true }),
            filter((row) => row.index < 5),
            select(/beds|baths|sq_ft|price/i),
            write(writeFilePath),
            resolve
        )
    })

    await new Promise((resolve) => {
        pipeline(
            csv(writeFilePath, { hasHeader: true }),
            aggregate("count", 0, (_, count) => count + 1),
            aggregate("total", 0, (row, total) => total + Number(row.get("price"))),
            result<{ count: number; total: number }>(({ count, total }) => {
                t.same(count, 5)
                t.ok(+total > 3e5)
            }),
            run(),
            resolve
        )
    })
})
