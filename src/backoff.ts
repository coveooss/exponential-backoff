import {
  IBackOffOptions,
  getSanitizedOptions,
  BackoffOptions
} from "./options";
import { DelayFactory } from "./delay/delay.factory";

export { BackoffOptions, IBackOffOptions };

export async function backOff<T>(
  request: () => Promise<T>,
  options: BackoffOptions = {}
): Promise<T> {
  const sanitizedOptions = getSanitizedOptions(options);
  const backOff = new BackOff(request, sanitizedOptions);

  return await backOff.execute();
}

class BackOff<T> {
  private attemptNumber = 0;
  private isAborted = false;

  constructor(
    private request: () => Promise<T>,
    private options: IBackOffOptions
  ) {}

  private _cancelWhenAborted() {
    if (this.options.signal) {
      this.options.signal.addEventListener("abort", () => {
        this.isAborted = true;
      });
    }
  }

  public async execute(): Promise<T> {
    this._cancelWhenAborted();

    while (!this.attemptLimitReached || !this.isAborted) {
      try {
        await this.applyDelay();
        return await this.request();
      } catch (e) {
        this.attemptNumber++;
        const shouldRetry = await this.options.retry(e, this.attemptNumber);

        if (!shouldRetry || this.attemptLimitReached || this.isAborted) {
          throw e;
        }
      }
    }

    throw new Error("Something went wrong.");
  }

  private get attemptLimitReached() {
    return this.attemptNumber >= this.options.numOfAttempts;
  }

  private async applyDelay() {
    const delay = DelayFactory(this.options, this.attemptNumber);
    await delay.apply();
  }
}
