import { IBackOffOptions, getSanitizedOptions } from './options';

export interface IBackOffRequest<T> {
  fn: () => Promise<T>;
  retry?: (e, attemptNumber: number) => boolean;
}

export async function backOff<T>(request: IBackOffRequest<T>, options: Partial<IBackOffOptions> = {}): Promise<T> {
  const sanitizedOptions = getSanitizedOptions(options);
  const backOff = new BackOff(request, sanitizedOptions);
  
  return await backOff.execute();
}

class BackOff<T> {
  private attemptNumber = 0;
  private delay = 0;
  
  constructor(private request: IBackOffRequest<T>, private options: IBackOffOptions) {
    this.delay = options.startingDelay;
  }

  public async execute(): Promise<T> {
    while (!this.attemptLimitReached) {
      try {
        await this.applyDelayIfNeeded();
        return await this.request.fn();
      } catch (e) {
        this.attemptNumber++;
        const shouldRetry = this.request.retry ? this.request.retry(e, this.attemptNumber) : true;
  
        if (!shouldRetry || this.attemptLimitReached) {
          throw e;
        }
      }
    }
  
    throw new Error('Something went wrong.');
  }

  private get attemptLimitReached() {
    return this.attemptNumber >= this.options.numOfAttempts
  }

  private async applyDelayIfNeeded() {
    if (this.shouldDelay) {
      await this.applyDelay();
      this.increaseDelayByTimeMultiple();
    }

    return true;
  }

  private get shouldDelay() {
    const doNotDelayFirstAttempt = !this.options.delayFirstAttempt;
    return (this.isFirstAttempt && doNotDelayFirstAttempt) ? false : true;
  }

  private get isFirstAttempt() {
    return this.attemptNumber === 0;
  }

  private applyDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  private increaseDelayByTimeMultiple() {
    this.delay *= this.options.timeMultiple;
  }
}
