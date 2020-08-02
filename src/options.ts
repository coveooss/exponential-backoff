export type JitterType = "none" | "full";

export interface IBackOffOptions {
  delayFirstAttempt: boolean;
  jitter: JitterType;
  maxDelay: number;
  numOfAttempts: number;
  retry: (e: any, attemptNumber: number) => boolean | Promise<boolean>;
  startingDelay: number;
  timeMultiple: number;
}

const defaultOptions: IBackOffOptions = {
  delayFirstAttempt: false,
  jitter: "none",
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
