export enum JitterTypes {
  None = "none",
  Full = "full"
}

export interface IBackOffOptions {
  delayFirstAttempt: boolean;
  jitter: JitterTypes;
  maxDelay: number;
  numOfAttempts: number;
  retry: (e: any, attemptNumber: number) => boolean;
  startingDelay: number;
  timeMultiple: number;
}

const defaultOptions: IBackOffOptions = {
  delayFirstAttempt: false,
  jitter: JitterTypes.None,
  maxDelay: Infinity,
  numOfAttempts: 10,
  retry: () => true,
  startingDelay: 100,
  timeMultiple: 2
};

export function getSanitizedOptions(options: Partial<IBackOffOptions>) {
  const sanitized: IBackOffOptions = { ...defaultOptions, ...options };

  if (sanitized.numOfAttempts < 1) {
    sanitized.numOfAttempts = 1;
  }

  return sanitized;
}
