export interface IBackOffOptions {
    numOfAttempts: number;
    timeMultiple: number;
    startingDelay: number;
}

const defaultOptions: IBackOffOptions = {
    numOfAttempts: 10,
    timeMultiple: 2,
    startingDelay: 100
};

export function getSanitizedOptions(options: Partial<IBackOffOptions>) {
    const sanitized: IBackOffOptions = { ...defaultOptions, ...options };

    if (sanitized.numOfAttempts < 1) {
        sanitized.numOfAttempts = 1;
    }

    return sanitized;
}