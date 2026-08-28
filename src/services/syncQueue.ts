/**
 * CMMS SIDRAH - Offline Queue & Synchronization Manager
 * Stores local mutations in localStorage and flushes to the backend when online.
 */

import { WorkOrder, VisitRecord } from '../types';

export interface QueuedItem {
  id: string;
  type: 'CREATE_WORK_ORDER' | 'UPDATE_WORK_ORDER' | 'CREATE_VISIT';
  payload: any;
  timestamp: string;
  retries: number;
  lastError?: string;
}

const QUEUE_STORAGE_KEY = 'cmms_offline_queue_v1';

export class SyncQueueManager {
  private queue: QueuedItem[] = [];
  private listeners: ((pendingCount: number) => void)[] = [];
  private isSyncing = false;

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncPendingQueue();
      });
    }
  }

  private loadQueue() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load offline queue from localStorage', e);
      this.queue = [];
    }
  }

  private saveQueue() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save offline queue', e);
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public getPendingItems(): QueuedItem[] {
    return [...this.queue];
  }

  public subscribe(listener: (pendingCount: number) => void): () => void {
    this.listeners.push(listener);
    listener(this.getPendingCount());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const count = this.getPendingCount();
    this.listeners.forEach(l => l(count));
  }

  public enqueue(type: QueuedItem['type'], payload: any): string {
    const id = `queue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const item: QueuedItem = {
      id,
      type,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0
    };
    this.queue.push(item);
    this.saveQueue();

    // If online, attempt to sync immediately
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.syncPendingQueue();
    }

    return id;
  }

  public async syncPendingQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing || this.queue.length === 0) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;
    const remaining: QueuedItem[] = [];

    for (const item of this.queue) {
      try {
        let endpoint = '';
        let method = 'POST';

        if (item.type === 'CREATE_WORK_ORDER') {
          endpoint = '/api/work-orders';
        } else if (item.type === 'UPDATE_WORK_ORDER') {
          endpoint = `/api/work-orders/${item.payload.wo_id || item.payload.id}`;
          method = 'PUT';
        } else if (item.type === 'CREATE_VISIT') {
          endpoint = '/api/work-orders/visits';
        }

        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });

        if (res.ok) {
          synced++;
        } else {
          item.retries += 1;
          item.lastError = `HTTP ${res.status}: ${res.statusText}`;
          remaining.push(item);
          failed++;
        }
      } catch (err: any) {
        item.retries += 1;
        item.lastError = err.message || 'Network error';
        remaining.push(item);
        failed++;
      }
    }

    this.queue = remaining;
    this.saveQueue();
    this.isSyncing = false;

    return { synced, failed };
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

export const syncQueue = new SyncQueueManager();
