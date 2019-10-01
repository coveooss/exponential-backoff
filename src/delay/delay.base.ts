import { IDelay } from "./delay.interface";
import { IBackOffOptions } from "../options";
import { JitterFactory } from "../jitter/jitter.factory";

export abstract class Delay implements IDelay {
    protected attempt = 0;
    constructor(private options: IBackOffOptions) {}

    public apply() {
        return new Promise(resolve => setTimeout(resolve, this.jitteredDelay));
    }
    
    public setAttemptNumber(attempt: number) {
        this.attempt = attempt;
    }

    private get jitteredDelay() {
        const jitter = JitterFactory(this.options);
        return jitter(this.delay);
    }

    private get delay() {
        const constant = this.options.startingDelay;
        const base = this.options.timeMultiple;
        const power = this.numOfDelayedAttempts;
        
        if (this.options.maxDelay !== undefined) {
            return Math.min(constant * Math.pow(base, power), this.options.maxDelay);
        }
        return constant * Math.pow(base, power);
    }

    protected get numOfDelayedAttempts() {
        return this.attempt;
    }
}