import { EventEmitter } from "node:events";

export interface SystemEvents {
  "user:login": { profileId: string; email: string; ipAddress?: string; timestamp: Date };
  "user:signup": { profileId: string; email: string; timestamp: Date };
  "organization:created": { organizationId: string; ownerId: string; slug: string };
  "subscription:updated": { organizationId: string; status: string; planName: string };
  "notification:send": { profileId: string; title: string; message: string; type: "info" | "success" | "warning" | "error" };
  "audit:log": { profileId?: string; action: string; resource: string; payload?: any };
}

export class EventBus<T extends Record<string, any>> {
  private emitter = new EventEmitter();

  constructor() {
    // Increase max listener warnings for larger system hook scopes
    this.emitter.setMaxListeners(50);
  }

  // Publish event asynchronously (non-blocking)
  publish<K extends keyof T & string>(event: K, payload: T[K]): void {
    setImmediate(() => {
      this.emitter.emit(event, payload);
    });
  }

  // Subscribe to an event, returning an unsubscribe helper
  subscribe<K extends keyof T & string>(event: K, handler: (payload: T[K]) => void | Promise<void>): () => void {
    const wrapper = async (payload: any) => {
      try {
        await handler(payload);
      } catch (err) {
        console.error(`❌ EventBus: Error in handler for event "${event}":`, err);
      }
    };

    this.emitter.on(event, wrapper);
    return () => {
      this.emitter.off(event, wrapper);
    };
  }
}

export const eventBus = new EventBus<SystemEvents>();
export default eventBus;
