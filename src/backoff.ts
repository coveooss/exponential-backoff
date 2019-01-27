import { IBackOffOptions, getSanitizedOptions } from './options';

export interface IBackOffRequest<T> {
  fn: () => Promise<T>;
  retry?: (e, attemptNumber: number) => boolean;
}

export async function backOff<T>(request: IBackOffRequest<T>, options: Partial<IBackOffOptions> = {}): Promise<T> {
  const sanitizedOptions = getSanitizedOptions(options);

  let attemptNumber = 0;
  let delay = sanitizedOptions.startingDelay;

  while (attemptNumber < sanitizedOptions.numOfAttempts) {
    try {
      await delayBeforeExecuting(delay);
      attemptNumber++;
      return await request.fn();
    } catch (e) {
      const shouldRetry = request.retry ? request.retry(e, attemptNumber) : true;
      const reachedRetryLimit = attemptNumber >= sanitizedOptions.numOfAttempts;

      if (!shouldRetry || reachedRetryLimit) {
        throw e;
      }

      delay *= sanitizedOptions.timeMultiple;
    }
  }

  throw new Error('Something went wrong.');
}

function delayBeforeExecuting(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay));
}
