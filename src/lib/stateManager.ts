// lib/stateManager.ts
class StateManager {
  private pendingUpdates = new Map<string, Promise<any>>();

  async executeWithLock<T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // Wait for any pending operation with the same key to complete
    while (this.pendingUpdates.has(key)) {
      await this.pendingUpdates.get(key);
    }

    const promise = operation().finally(() => {
      this.pendingUpdates.delete(key);
    });

    this.pendingUpdates.set(key, promise);
    return promise;
  }
}

export const stateManager = new StateManager();
