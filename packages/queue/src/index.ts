export type JobPriority = "low" | "normal" | "high";

export interface Job<T = any> {
  id: string;
  name: string;
  payload: T;
  priority: JobPriority;
  attempts: number;
  maxAttempts: number;
  runAt?: Date;
  error?: string;
}

export type JobHandler<T = any> = (payload: T) => Promise<void> | void;

class JobQueue {
  private queue: Job[] = [];
  private handlers = new Map<string, JobHandler>();
  private dlq: Job[] = []; // Dead Letter Queue for permanently failed jobs
  private isProcessing = false;

  // Register a worker handler for a specific job name
  registerHandler<T>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler);
  }

  // Push job to queue
  async push<T>(data: {
    name: string;
    payload: T;
    priority?: JobPriority;
    maxAttempts?: number;
    delaySeconds?: number;
  }): Promise<string> {
    const id = Math.random().toString(36).substring(2, 9);
    const runAt = data.delaySeconds ? new Date(Date.now() + data.delaySeconds * 1000) : undefined;

    const job: Job = {
      id,
      name: data.name,
      payload: data.payload,
      priority: data.priority || "normal",
      attempts: 0,
      maxAttempts: data.maxAttempts || 3,
      runAt,
    };

    this.queue.push(job);
    
    // Sort queue by priority (high first) and runAt
    this.sortQueue();

    // Trigger queue processor asynchronously
    if (!this.isProcessing) {
      this.processQueue();
    }

    return id;
  }

  private sortQueue() {
    const priorityWeights = { high: 3, normal: 2, low: 1 };
    this.queue.sort((a, b) => {
      const aWeight = priorityWeights[a.priority];
      const bWeight = priorityWeights[b.priority];
      
      if (aWeight !== bWeight) return bWeight - aWeight;
      
      const aTime = a.runAt?.getTime() || 0;
      const bTime = b.runAt?.getTime() || 0;
      return aTime - bTime;
    });
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const now = Date.now();

    // Find the next executable job
    const jobIndex = this.queue.findIndex((j) => !j.runAt || j.runAt.getTime() <= now);

    if (jobIndex === -1) {
      // All remaining jobs are delayed; sleep briefly and re-trigger
      setTimeout(() => this.processQueue(), 500);
      return;
    }

    // Extract the job
    const [job] = this.queue.splice(jobIndex, 1);
    const handler = this.handlers.get(job.name);

    if (!handler) {
      console.warn(`⚠️ JobQueue: No handler registered for job "${job.name}". Placing in DLQ.`);
      this.dlq.push(job);
      this.processQueue();
      return;
    }

    try {
      job.attempts++;
      await handler(job.payload);
    } catch (err: any) {
      job.error = err.message || String(err);
      if (job.attempts < job.maxAttempts) {
        // Retry job after dynamic back-off delay (e.g. 5s, 10s, 15s)
        const delaySeconds = job.attempts * 5;
        job.runAt = new Date(Date.now() + delaySeconds * 1000);
        console.warn(`⚠️ JobQueue: Job "${job.name}" failed (attempt ${job.attempts}/${job.maxAttempts}). Retrying in ${delaySeconds}s...`);
        this.queue.push(job);
        this.sortQueue();
      } else {
        console.error(`❌ JobQueue: Job "${job.name}" failed permanently after ${job.attempts} attempts. Sending to DLQ.`, err);
        this.dlq.push(job);
      }
    }

    // Continue processing queue
    setImmediate(() => this.processQueue());
  }

  // Get active queue length
  getQueueLength(): number {
    return this.queue.length;
  }

  // Inspect the Dead Letter Queue
  getDLQ(): Job[] {
    return [...this.dlq];
  }
}

export const queue = new JobQueue();
export default queue;
