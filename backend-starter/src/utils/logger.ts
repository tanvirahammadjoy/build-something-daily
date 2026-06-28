/* eslint-disable no-console */
const timestamp = (): string => new Date().toISOString();

export const logger = {
    info: (...args: unknown[]): void =>
        console.log(`[INFO] ${timestamp()} -`, ...args),
    warn: (...args: unknown[]): void =>
        console.warn(`[WARN] ${timestamp()} -`, ...args),
    error: (...args: unknown[]): void =>
        console.error(`[ERROR] ${timestamp()} -`, ...args),
};
