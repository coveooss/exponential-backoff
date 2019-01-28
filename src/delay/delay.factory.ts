import { IBackOffOptions } from "../options";
import { SkipFirstDelay } from "./skip-first/skip-first.delay";
import { AlwaysDelay } from "./always/always.delay";

export function DelayFactory(options: IBackOffOptions) {
    if (!options.delayFirstAttempt) {
        return new SkipFirstDelay(options);
    }

    return new AlwaysDelay(options);
}