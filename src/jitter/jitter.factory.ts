import { IBackOffOptions, JitterTypes } from "../options";
import { fullJitter } from "./full/full.jitter";
import { noJitter } from "./no/no.jitter";

export type Jitter = (delay: number) => number;

export function JitterFactory(options: IBackOffOptions): Jitter {
    switch (options.jitter) {
        case JitterTypes.Full:
            return fullJitter
        
        case JitterTypes.None:
        default:
            return noJitter
    }
}
