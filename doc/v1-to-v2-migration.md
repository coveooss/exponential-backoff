## Migrating from v1 to v2

If you are migrating from v1 to v2, be aware of the following breaking changes:

- The first argument of `backOff<T>` is now just the function you want to backoff. The `retry` function is still available as a property of `IBackOffOptions`.

- The default value for the `delayFirstAttempt` option is now `false`.

That's all folks!
