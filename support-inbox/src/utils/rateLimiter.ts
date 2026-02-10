/**
 * Simple debouncer that coalesces multiple calls for the same key
 * within a time window into a single execution.
 */
export class Debouncer {
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private delayMs: number;

  constructor(delayMs: number) {
    this.delayMs = delayMs;
  }

  /**
   * Schedule a function to run after the debounce window.
   * If called again with the same key before the window elapses,
   * the previous call is cancelled and the timer resets.
   */
  debounce(key: string, fn: () => void): void {
    const existing = this.timers.get(key);
    if (existing) {
      clearTimeout(existing);
    }
    const timer = setTimeout(() => {
      this.timers.delete(key);
      fn();
    }, this.delayMs);
    this.timers.set(key, timer);
  }

  /** Cancel a pending debounced call */
  cancel(key: string): void {
    const existing = this.timers.get(key);
    if (existing) {
      clearTimeout(existing);
      this.timers.delete(key);
    }
  }

  /** Cancel all pending calls */
  cancelAll(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}
