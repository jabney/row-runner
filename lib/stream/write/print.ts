import { EOL } from "os"
import { Writable } from "stream"
import { DoneFn } from "../../types"
import { Writer } from "./writer"

const isConsole = (writer?: typeof console | Writable): writer is typeof console => {
    return writer === console
}

/**
 * Write rows of data to stdout.
 */
export const print = (done?: DoneFn, writer: typeof console | Writable = console) => {
    return new Writer(
        null,
        (row) => void (isConsole(writer) ? console.log(row.asObject()) : writer.write(row.toJSON() + EOL)),
        done
    )
}
