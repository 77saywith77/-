import { Task, VALID_PRIORITIES, TaskPriority } from '../types/task';

export const STORAGE_KEY = 'my_work_planner_tasks_v1';

export function generateUniqueId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function loadTasksFromStorage(): { tasks: Task[]; error: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { tasks: [], error: false };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { tasks: [], error: false };
    }

    const seenIds = new Set<string>();
    const tasks: Task[] = parsed
      .filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === 'object' && typeof (item as Record<string, unknown>).title === 'string'
      )
      .map((item) => {
        let id =
          typeof item.id === 'string' && item.id.trim()
            ? item.id
            : generateUniqueId();
        while (seenIds.has(id)) {
          id = generateUniqueId();
        }
        seenIds.add(id);

        const rawPriority = item.priority as TaskPriority;
        const priority: TaskPriority = VALID_PRIORITIES.has(rawPriority)
          ? rawPriority
          : '보통';
        const dueDate =
          typeof item.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate)
            ? item.dueDate
            : '';

        return {
          id,
          title: String(item.title),
          priority,
          dueDate,
          completed: Boolean(item.completed),
        };
      });

    return { tasks, error: false };
  } catch {
    return { tasks: [], error: true };
  }
}

export function saveTasksToStorage(tasks: Task[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}
