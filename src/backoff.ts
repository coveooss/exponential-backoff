import {
  IBackOffOptions,
  getSanitizedOptions,
  BackoffOptions
} from "./options";
import { DelayFactory } from "./delay/delay.factory";

export { BackoffOptions, IBackOffOptions };

/**
 * Executes a function with exponential backoff.
 * @param request the function to be executed
 * @param options options to customize the backoff behavior
 * @returns Promise that resolves to the result of the `request` function
 */
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
    const { signal } = this.options;

    if (!signal) return;

    if (signal.aborted) {
      this.isAborted = true;
      return;
    }

    signal.addEventListener(
      "abort",
      () => {
        this.isAborted = true;
      },
      { once: true }
    );
  }

  public async execute(): Promise<T> {
    this._cancelWhenAborted();

    while (!this.isAborted && !this.attemptLimitReached) {
      try {
        await this.applyDelay();
        return await this.request();
      } catch (e) {
        this.attemptNumber++;
        const shouldRetry = await this.options.retry(e, this.attemptNumber);

        if (!shouldRetry || this.isAborted || this.attemptLimitReached) {
          throw e;
        }
      }
    }

    throw new Error(this.isAborted ? "Retry aborted" : "Something went wrong.");
  }

  private get attemptLimitReached() {
    return this.attemptNumber >= this.options.numOfAttempts;
  }

  private async applyDelay() {
    const delay = DelayFactory(this.options, this.attemptNumber);
    await delay.apply();
  }
}
