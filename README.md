# exponential-backoff
A utility that allows retrying a function with an exponential delay between attempts.

## Installation

```
npm i exponential-backoff
```

## Usage
The generic `backOff<T>` function takes an `IBackOffRequest<T>` object, and an optional `IBackOffOptions` object. It returns a generic `Promise<T>`.

```
function backOff<T>(request: IBackOffRequest<T>, options: Partial<IBackOffOptions> = {}): Promise<T>
```

### `IBackOffRequest<T>`
* `fn: () => Promise<T>`

    The function to be attempted.

* `retry?: (e, attemptNumber: number) => boolean`
    
    Everytime `fn` returns a rejected promise, the `retry` function is called with the error and the attempt number. Returning `true` will reattempt the function as long as the `numOfAttempts` has not been exceeded. Returning `false` will end the execution.
    
    Default value is a function that always returns `true`.

### `IBackOffOptions`
* `delayFirstAttempt?: boolean`

    Decides whether the `startingDelay` should be applied before the first call to `fn`. If `false`, the first call to `fn` will occur without a delay.

    Default value is `true`.

* `numOfAttempts?: number`

    The maximum number of times to attempt the function.
    
    Default value is `10`.
    
    Minimum value is `1`.

* `startingDelay?: number`

    The delay before executing the function for the first time.
    
    Default value is `100` ms.

* `timeMultiple?: number`

    The `startingDelay` is multiplied by the `timeMultiple` value to increase the delay between reattempts.
    
    Default value is `2`.