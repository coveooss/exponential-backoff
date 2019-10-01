export enum JitterTypes {
  None = "none",
  Full = "full"
}

export interface IBackOffOptions {
  delayFirstAttempt: boolean;
  jitter: JitterTypes;
  numOfAttempts: number;
  retry: (e: any, attemptNumber: number) => boolean;
  timeMultiple: number;
  startingDelay: number;
  maxDelay?: number;
}

const defaultOptions: IBackOffOptions = {
  delayFirstAttempt: false,
  jitter: JitterTypes.None,
  retry: () => true,
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
