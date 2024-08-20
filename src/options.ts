export type JitterType = "none" | "full";

export type BackoffOptions = Partial<IBackOffOptions>;

export interface IBackOffOptions {
  delayFirstAttempt: boolean;
  jitter: JitterType;
  maxDelay: number;
  numOfAttempts: number;
  retry: (e: any, attemptNumber: number) => boolean | Promise<boolean>;
  startingDelay: number;
  timeMultiple: number;
  signal?: AbortSignal;
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

export function getSanitizedOptions(options: BackoffOptions) {
  const sanitized: IBackOffOptions = { ...defaultOptions, ...options };

  if (sanitized.numOfAttempts < 1) {
    sanitized.numOfAttempts = 1;
  }

  return sanitized;
}
