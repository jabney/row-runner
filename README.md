# Row Runner

Process CSV files as streams of rows.

Declarative. Opinionated.

## Experimental

### v0.1.x

- The interface is mostly stable.
- Decent amount of test coverage.

    File      | % Stmts | % Branch | % Funcs | % Lines
    ----------|---------|----------|---------|---------
    All files | 100     | 85.71    | 100     | 100

### >= v0.2.x

- Things could change.

### Installation

```sh
npm install row-runner
```

## Usage (Getting Started)

### Sample Data (CSV)

    ┌──────────────────┬─────────┬───────┬──────┬───────┬────────┬─────────┐
    │       city       │   zip   │ state │ beds │ baths │ sq_ft  │  price  │
    ├──────────────────┼─────────┼───────┼──────┼───────┼────────┼─────────┤
    │    SACRAMENTO    │  95824  │  CA   │  2   │   1   │  797   │  81900  │
    │    SACRAMENTO    │  95841  │  CA   │  3   │   1   │  1122  │  89921  │
    │    SACRAMENTO    │  95842  │  CA   │  3   │   2   │  1104  │  90895  │
    │    SACRAMENTO    │  95820  │  CA   │  3   │   1   │  1177  │  91002  │
    │  RANCHO CORDOVA  │  95670  │  CA   │  2   │   2   │  941   │  94905  │
    └──────────────────┴─────────┴───────┴──────┴───────┴────────┴─────────┘

### Select Columns

```ts
import { pipeline } from "stream"
import { csv, select, write } from "row-runner"

// With stream pipeline
pipeline(
  csv("real-estate.csv", { hasHeader: true }), // read
  select(["beds", "baths", "sq_ft", "price"]), // transform
  write("example1a.csv")                        // write
)

// With chained pipes
csv("real-estate.csv", { hasHeader: true })
  .pipe(select(["beds", "baths", "sq_ft", "price"]))
  .pipe(write("example1b.csv"))

// As a promise
await new Promise((resolve) => {
  csv("real-estate.csv", { hasHeader: true })
    .pipe(select(["beds", "baths", "sq_ft", "price"]))
    .pipe(write("example1c.csv"), resolve)
})
```

#### Output (CSV)

    ┌──────┬───────┬────────┬─────────┐
    │ beds │ baths │ sq_ft  │  price  │
    ├──────┼───────┼────────┼─────────┤
    │  2   │   1   │  797   │  81900  │
    │  3   │   1   │  1122  │  89921  │
    │  3   │   2   │  1104  │  90895  │
    │  3   │   1   │  1177  │  91002  │
    │  2   │   2   │  941   │  94905  │
    └──────┴───────┴────────┴─────────┘

### Filter Rows

```ts
import { csv, select, filter, write } from "row-runner"

csv("real-estate.csv", { hasHeader: true })
  .pipe(select(["beds", "baths", "sq_ft", "price"]))
  .pipe(filter((row) => +row.get("sq_ft") > 1000))
  .pipe(write("example2.csv"))
```

#### Output (CSV)

    ┌──────┬───────┬────────┬─────────┐
    │ beds │ baths │ sq_ft  │  price  │
    ├──────┼───────┼────────┼─────────┤
    │  3   │   1   │  1122  │  89921  │
    │  3   │   2   │  1104  │  90895  │
    │  3   │   1   │  1177  │  91002  │
    └──────┴───────┴────────┴─────────┘

### Aggregate

```ts
import { pipeline } from "stream"
import { csv, describe, aggregate, report, run } from "row-runner"

pipeline(
  csv("real-estate.csv", { hasHeader: true }),
  describe([{ cols: "price", type: "number" }]),
  aggregate("count", 0, (_, count) => count + 1),
  aggregate("total", 0, (row, total) => total + row.getTyped<number>("price")),
  report("example3.csv", ({ count, total }) => [
      ["count", "total"],
      [count, `$${total.toLocaleString()}`],
  ]),
  run(),
  () => {} // done callback for pipeline
)
```

#### Output (CSV)

    ┌───────┬────────────┐
    │ count │   total    │
    ├───────┼────────────┤
    │   5   │  $448,623  │
    └───────┴────────────┘
