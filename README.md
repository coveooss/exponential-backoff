# exponential-backoff

A utility that allows retrying a function with an exponential delay between attempts.

## Installation

```
npm i exponential-backoff
```

## Usage

The generic `backOff<T>` function takes a function `() => Promise<T>` to be retried, and an optional `IBackOffOptions` object. It returns a generic `Promise<T>`.

```
import { backOff } from 'exponential-backoff' 

function backOff<T>(request: () => Promise<T>, options: IBackOffOptions = {}): Promise<T>
```

Migrating from v1 to v2? Here are our [breaking changes](https://github.com/coveo/exponential-backoff/tree/master/doc/v1-to-v2-migration.md).

### `IBackOffOptions`

- `delayFirstAttempt?: boolean`

  Decides whether the `startingDelay` should be applied before the first call. If `false`, the first call will occur without a delay.

  Default value is `false`.

- `jitter?: JitterType | string`

  Decides whether a [jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) should be applied to the delay. Possible values are `full` and `none`.

  Default value is `none`.

- `numOfAttempts?: number`

  The maximum number of times to attempt the function.

  Default value is `10`.

  Minimum value is `1`.

- `retry?: (e: any, attemptNumber: number) => boolean`

  Everytime the function returns a rejected promise, the `retry` function is called with the error and the attempt number. Returning `true` will reattempt the function as long as the `numOfAttempts` has not been exceeded. Returning `false` will end the execution.

  Default value is a function that always returns `true`.

- `startingDelay?: number`

  The delay before executing the function for the first time.

  Default value is `100` ms.

- `timeMultiple?: number`

  The `startingDelay` is multiplied by the `timeMultiple` to increase the delay between reattempts.

  Default value is `2`.
