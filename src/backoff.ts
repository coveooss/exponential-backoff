import { IBackOffOptions, getSanitizedOptions } from './options';
import { IDelay } from './delay/delay.interface';
import { DelayFactory } from './delay/delay.factory';

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
  private delay: IDelay;

  constructor(private request: IBackOffRequest<T>, private options: IBackOffOptions) {
    this.delay = DelayFactory(options);
  }

  public async execute(): Promise<T> {
    while (!this.attemptLimitReached) {
      try {
        await this.applyDelay();
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

  private async applyDelay() {
    this.delay.setAttemptNumber(this.attemptNumber);
    await this.delay.apply();
  }
}
