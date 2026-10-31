import { ScanMode } from '../core-engine/types';
import { globalEventBus } from '../core-engine/EventBus';

export interface ScheduledTask {
  id: string;
  name: string;
  type: 'scan' | 'definitions_update' | 'cache_cleanup';
  scanMode?: ScanMode;
  frequency: 'daily' | 'weekly' | 'hourly';
  time: string; // e.g. "03:00"
  enabled: boolean;
  lastRunTimestamp?: number;
  nextRunTimestamp: number;
}

export class SchedulerService {
  private static instance: SchedulerService;
  private tasks: ScheduledTask[] = [];

  private constructor() {
    this.tasks = [
      {
        id: 'sched-1',
        name: 'Daily Automated Quick Scan',
        type: 'scan',
        scanMode: 'quick',
        frequency: 'daily',
        time: '04:00 AM',
        enabled: true,
        lastRunTimestamp: Date.now() - 3600000 * 14,
        nextRunTimestamp: Date.now() + 3600000 * 10,
      },
      {
        id: 'sched-2',
        name: 'Weekly Deep System Audit & Registry Scrub',
        type: 'scan',
        scanMode: 'deep',
        frequency: 'weekly',
        time: 'Sunday 02:00 AM',
        enabled: true,
        lastRunTimestamp: Date.now() - 86400000 * 3,
        nextRunTimestamp: Date.now() + 86400000 * 4,
      },
      {
        id: 'sched-3',
        name: 'Threat Definition Feed Synchronization',
        type: 'definitions_update',
        frequency: 'hourly',
        time: 'Every 4 Hours',
        enabled: true,
        lastRunTimestamp: Date.now() - 3600000 * 2,
        nextRunTimestamp: Date.now() + 3600000 * 2,
      },
    ];
  }

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  public getTasks(): ScheduledTask[] {
    return [...this.tasks];
  }

  public toggleTask(id: string): void {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.enabled = !task.enabled;
      globalEventBus.emit('scheduler_updated', this.tasks);
    }
  }

  public addTask(task: Omit<ScheduledTask, 'id' | 'nextRunTimestamp'>): ScheduledTask {
    const newTask: ScheduledTask = {
      ...task,
      id: `sched-${Date.now()}`,
      nextRunTimestamp: Date.now() + 86400000,
    };
    this.tasks.push(newTask);
    globalEventBus.emit('scheduler_updated', this.tasks);
    return newTask;
  }
}

export const schedulerService = SchedulerService.getInstance();
