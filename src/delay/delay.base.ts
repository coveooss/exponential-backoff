import { IDelay } from "./delay.interface";
import { IBackOffOptions } from "../options";

export abstract class Delay implements IDelay {
    protected attempt = 0;
    constructor(private options: IBackOffOptions) {}

    public apply() {
        return new Promise(resolve => setTimeout(resolve, this.delay));
    }
    
    public setAttemptNumber(attempt: number) {
        this.attempt = attempt;
    }

    private get delay() {
        const constant = this.options.startingDelay;
        const base = this.options.timeMultiple;
        const power = this.numOfDelayedAttempts;
        
        return constant * Math.pow(base, power);
    }

    protected get numOfDelayedAttempts() {
        return this.attempt;
    }
}