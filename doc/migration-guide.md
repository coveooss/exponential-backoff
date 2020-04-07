If you are migrating across a major version, be aware of the following breaking changes:

## Migrating from v1 to v2

- The first argument of `backOff<T>` is now just the function you want to backoff. The `retry` function is still available as a property of `IBackOffOptions`.

- The default value for the `delayFirstAttempt` option is now `false`.

## Migrating from v2 to v3

- The `jitter` option now uses a union string type for easier configurability. The `JitterTypes` enum is no longer available.

That's all folks!
