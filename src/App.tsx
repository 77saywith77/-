/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Info, Search, X } from 'lucide-react';
import { TaskForm } from './components/TaskForm';
import { TaskItem } from './components/TaskItem';
import { Task, TaskFilter, TaskPriority } from './types/task';
import { formatTodayDisplay, getLocalTodayString } from './utils/date';
import {
  generateUniqueId,
  loadTasksFromStorage,
  saveTasksToStorage,
} from './utils/storage';

const FILTER_TABS: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'active', label: '진행 중' },
  { id: 'completed', label: '완료' },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const { tasks: initialTasks } = loadTasksFromStorage();
    return initialTasks;
  });
  const [storageError, setStorageError] = useState<boolean>(() => {
    const { error } = loadTasksFromStorage();
    return error;
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [todayStr, setTodayStr] = useState<string>(() => getLocalTodayString());

  useEffect(() => {
    const interval = window.setInterval(() => {
      const nextToday = getLocalTodayString();
      setTodayStr((prev) => (prev === nextToday ? prev : nextToday));
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const persistTasks = (nextTasks: Task[]) => {
    setTasks(nextTasks);
    const ok = saveTasksToStorage(nextTasks);
    setStorageError(!ok);
  };

  const handleAddTask = (
    title: string,
    priority: TaskPriority,
    dueDate: string
  ) => {
    const newTask: Task = {
      id: generateUniqueId(),
      title,
      priority,
      dueDate,
      completed: false,
    };
    persistTasks([newTask, ...tasks]);
  };

  const handleToggleComplete = (taskId: string) => {
    const nextTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    persistTasks(nextTasks);
  };

  const handleSaveEdit = (
    taskId: string,
    title: string,
    priority: TaskPriority,
    dueDate: string
  ) => {
    const nextTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, title, priority, dueDate } : task
    );
    setEditingTaskId(null);
    persistTasks(nextTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const nextTasks = tasks.filter((task) => task.id !== taskId);
    if (editingTaskId === taskId) {
      setEditingTaskId(null);
    }
    persistTasks(nextTasks);
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const overdue = tasks.filter(
      (t) => !t.completed && Boolean(t.dueDate) && t.dueDate < todayStr
    ).length;
    return { total, active, completed, overdue };
  }, [tasks, todayStr]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      if (filter === 'active' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;
      if (normalizedQuery && !task.title.toLowerCase().includes(normalizedQuery)) {
        return false;
      }
      return true;
    });
  }, [tasks, filter, searchQuery]);

  const todayDisplay = formatTodayDisplay(todayStr);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 sm:text-2xl">
            내 업무 플래너
          </h1>
          <p className="tabular-nums text-sm font-semibold text-blue-600 whitespace-nowrap shrink-0">
            {todayDisplay}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {storageError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              저장되지 않았습니다. 브라우저 저장 공간 설정이나 용량 제한으로 인해
              변경 내용을 저장할 수 없습니다.
            </span>
          </div>
        )}

        <div
          role="note"
          className="mb-6 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span>
            이 브라우저에 저장되며 다른 기기와 자동 동기화되지 않습니다.
          </span>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[360px_1fr] lg:gap-8">
          <div className="lg:sticky lg:top-6">
            <TaskForm onAddTask={handleAddTask} />
          </div>

          <section
            className="rounded-xl border border-slate-200 bg-white"
            aria-labelledby="taskListHeading"
          >
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2
                  id="taskListHeading"
                  className="text-base font-bold tracking-tight text-slate-900"
                >
                  업무 목록
                </h2>
                <div
                  aria-live="polite"
                  className="tabular-nums flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-slate-600"
                >
                  <span>
                    전체 <strong className="font-bold text-slate-900">{stats.total}</strong>
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span>
                    진행 중 <strong className="font-bold text-blue-600">{stats.active}</strong>
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span>
                    완료 <strong className="font-bold text-emerald-700">{stats.completed}</strong>
                  </span>
                  {stats.overdue > 0 && (
                    <>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span>
                        기한 지남{' '}
                        <strong className="font-bold text-red-700">
                          {stats.overdue}
                        </strong>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {tasks.length > 0 && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div
                    role="tablist"
                    aria-label="업무 상태 필터"
                    className="inline-flex items-center gap-1 self-start rounded-lg bg-slate-100 p-1"
                  >
                    {FILTER_TABS.map((tab) => {
                      const active = filter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setFilter(tab.id)}
                          className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                            active
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative flex-1 sm:max-w-[240px]">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="업무명 검색"
                      aria-label="업무명 검색"
                      className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:border-blue-600 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/20"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="검색어 지우기"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {tasks.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-base font-bold text-slate-900">
                  등록된 업무가 아직 없습니다.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  입력창에서 업무명과 우선순위, 필요 시 마감일을 선택해 첫 업무를
                  등록해 보세요.
                  <br />
                  체크박스로 완료 상태를 관리할 수 있습니다.
                </p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-semibold text-slate-900">
                  조건에 일치하는 업무가 없습니다.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              <ul aria-label="등록된 업무 목록">
                {filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    todayStr={todayStr}
                    isEditing={editingTaskId === task.id}
                    onToggleComplete={handleToggleComplete}
                    onStartEdit={(id) => setEditingTaskId(id)}
                    onCancelEdit={() => setEditingTaskId(null)}
                    onSaveEdit={handleSaveEdit}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
