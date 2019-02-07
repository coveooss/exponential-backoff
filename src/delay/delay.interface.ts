export interface IDelay {
    apply: () => Promise<{}>
    setAttemptNumber: (attempt: number) => void;
}