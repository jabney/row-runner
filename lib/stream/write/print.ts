import { DoneFn } from "../../types"
import { Writer } from "./writer"

/**
 * Write rows of data to stdout.
 */
export const print = (done: DoneFn) => {
    return new Writer(
        null,
        (row) => {
            console.log(row.asObject())
        },
        done
    )
}
