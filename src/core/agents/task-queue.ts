import { AgentTaskRequest, AgentTaskResult } from './agent.types';
import { AgentRegistry } from './agent-registry';

export interface QueuedTask {
  id: string;
  request: AgentTaskRequest;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  result?: AgentTaskResult;
  error?: string;
  queuedAt: string;
  completedAt?: string;
}

export class AsyncTaskQueue {
  private queue: Map<string, QueuedTask> = new Map();
  private registry: AgentRegistry;

  constructor(registry: AgentRegistry) {
    this.registry = registry;
  }

  enqueueTask(request: AgentTaskRequest, maxAttempts: number = 3): QueuedTask {
    const task: QueuedTask = {
      id: request.taskId,
      request,
      status: 'queued',
      attempts: 0,
      maxAttempts,
      queuedAt: new Date().toISOString(),
    };

    this.queue.set(task.id, task);
    return task;
  }

  async processNextTask(): Promise<QueuedTask | null> {
    const queuedTask = Array.from(this.queue.values()).find((t) => t.status === 'queued');
    if (!queuedTask) return null;

    queuedTask.status = 'processing';
    queuedTask.attempts += 1;

    try {
      const result = await this.registry.dispatchTask(queuedTask.request);
      queuedTask.status = 'completed';
      queuedTask.result = result;
      queuedTask.completedAt = new Date().toISOString();
    } catch (err) {
      if (queuedTask.attempts < queuedTask.maxAttempts) {
        queuedTask.status = 'queued'; // Re-enqueue for retry
      } else {
        queuedTask.status = 'failed';
        queuedTask.error = (err as Error).message;
        queuedTask.completedAt = new Date().toISOString();
      }
    }

    return queuedTask;
  }

  getTaskStatus(taskId: string): QueuedTask | null {
    return this.queue.get(taskId) || null;
  }

  listTasks(businessId?: string): QueuedTask[] {
    const list = Array.from(this.queue.values());
    return businessId ? list.filter((t) => t.request.businessId === businessId) : list;
  }
}
