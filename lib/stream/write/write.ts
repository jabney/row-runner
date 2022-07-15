import { createWriteStream } from "fs"
import { EOL } from "os"
import { DoneFn } from "../../types"
import { Writer } from "./writer"

/**
 * Write rows of data to csv file.
 */
export const write = (path: string, done?: DoneFn) => {
    const writeStream = createWriteStream(path)
    return new Writer(writeStream, (row) => row.values.join(",") + EOL, done)
}
