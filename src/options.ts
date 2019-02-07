export enum JitterTypes {
    None = 'none',
    Full = 'full'
}

export interface IBackOffOptions {
    numOfAttempts: number;
    timeMultiple: number;
    startingDelay: number;
    delayFirstAttempt: boolean;
    jitter: JitterTypes
}

const defaultOptions: IBackOffOptions = {
    numOfAttempts: 10,
    timeMultiple: 2,
    startingDelay: 100,
    delayFirstAttempt: true,
    jitter: JitterTypes.None
};

export function getSanitizedOptions(options: Partial<IBackOffOptions>) {
    const sanitized: IBackOffOptions = { ...defaultOptions, ...options };

    if (sanitized.numOfAttempts < 1) {
        sanitized.numOfAttempts = 1;
    }

    return sanitized;
}