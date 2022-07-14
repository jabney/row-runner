import { DoneFn } from "../../types"
import { Writer, WriteTransFn } from "./writer"

/**
 * Write rows of data to stdout.
 */
export const each = (cb: WriteTransFn, done: DoneFn) => {
    return new Writer(null, cb, done)
}
