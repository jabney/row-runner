import { DoneFn } from "../../types"
import { Writer } from "./writer"

/**
 * Null writer
 */
export const run = (done?: DoneFn) => {
    return new Writer(null, null, done)
}
