export type TaskPriority = '높음' | '보통' | '낮음';

export type TaskFilter = 'all' | 'active' | 'completed';

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate: string;
  completed: boolean;
}

export const VALID_PRIORITIES = new Set<TaskPriority>(['높음', '보통', '낮음']);
