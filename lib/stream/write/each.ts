import { DoneFn } from "../../types"
import { Writer, WriteProjectFn } from "./writer"

/**
 * Write rows of data to stdout.
 */
export const each = (cb: WriteProjectFn, done: DoneFn) => {
    return new Writer(null, cb, done)
}
