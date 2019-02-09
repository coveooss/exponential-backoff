import { IBackOffOptions, getSanitizedOptions } from "./options";
import { DelayFactory } from "./delay/delay.factory";

export async function backOff<T>(
  request: () => Promise<T>,
  options: Partial<IBackOffOptions> = {}
): Promise<T> {
  const sanitizedOptions = getSanitizedOptions(options);
  const backOff = new BackOff(request, sanitizedOptions);

  return await backOff.execute();
}

class BackOff<T> {
  private attemptNumber = 0;

  constructor(
    private request: () => Promise<T>,
    private options: IBackOffOptions
  ) {}

  public async execute(): Promise<T> {
    while (!this.attemptLimitReached) {
      try {
        await this.applyDelay();
        return await this.request();
      } catch (e) {
        this.attemptNumber++;
        const shouldRetry = this.options.retry(e, this.attemptNumber);

        if (!shouldRetry || this.attemptLimitReached) {
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
