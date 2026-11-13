import React, { useRef, useState } from 'react';
import { Calendar, Flag, Plus, X } from 'lucide-react';
import { TaskPriority } from '../types/task';

interface TaskFormProps {
  onAddTask: (title: string, priority: TaskPriority, dueDate: string) => void;
}

const PRIORITY_OPTIONS: {
  value: TaskPriority;
  activeClass: string;
  iconClass: string;
}[] = [
  {
    value: '높음',
    activeClass: 'border-red-600 bg-red-50 text-red-700',
    iconClass: 'text-red-600',
  },
  {
    value: '보통',
    activeClass: 'border-blue-600 bg-blue-50 text-blue-700',
    iconClass: 'text-blue-600',
  },
  {
    value: '낮음',
    activeClass: 'border-slate-500 bg-slate-100 text-slate-900',
    iconClass: 'text-slate-500',
  },
];

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('보통');
  const [dueDate, setDueDate] = useState('');
  const [titleError, setTitleError] = useState('');

  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setTitle(nextValue);
    if (nextValue.trim() !== '' && titleError) {
      setTitleError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      if (title.length > 0) {
        setTitleError('공백만 입력할 수 없습니다. 구체적인 업무명을 입력해 주세요.');
      } else {
        setTitleError('업무명이 비어 있습니다. 업무명을 입력해 주세요.');
      }
      titleInputRef.current?.focus();
      return;
    }

    onAddTask(trimmed, priority, dueDate);
    setTitle('');
    setPriority('보통');
    setDueDate('');
    setTitleError('');
    titleInputRef.current?.focus();
  };

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
      aria-labelledby="addTaskHeading"
    >
      <h2
        id="addTaskHeading"
        className="mb-4 text-base font-bold tracking-tight text-slate-900"
      >
        새 업무 등록
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="taskTitleInput"
            className="text-sm font-semibold text-slate-900"
          >
            업무명
          </label>
          <input
            ref={titleInputRef}
            id="taskTitleInput"
            type="text"
            value={title}
            onChange={handleTitleChange}
            maxLength={150}
            autoComplete="off"
            placeholder="예: 주간 보고서 초안 작성"
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? 'titleError' : undefined}
            className={`min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/20 ${
              titleError
                ? 'border-red-600 focus:border-red-600'
                : 'border-slate-300 focus:border-blue-600'
            }`}
          />
          {titleError && (
            <p
              id="titleError"
              role="alert"
              className="mt-0.5 text-sm font-medium text-red-600"
            >
              {titleError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-900">우선순위</span>
          <div
            role="radiogroup"
            aria-label="우선순위 선택"
            className="grid grid-cols-3 gap-2"
          >
            {PRIORITY_OPTIONS.map((opt) => {
              const isSelected = priority === opt.value;
              const radioId = `priority-${opt.value}`;
              return (
                <div key={opt.value} className="relative">
                  <input
                    id={radioId}
                    type="radio"
                    name="priority"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => setPriority(opt.value)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={radioId}
                    className={`flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 select-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-1 ${
                      isSelected
                        ? opt.activeClass
                        : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Flag
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isSelected ? opt.iconClass : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{opt.value}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="taskDueDateInput"
            className="text-sm font-semibold text-slate-900"
          >
            마감일{' '}
            <span className="text-xs font-medium text-slate-500">
              (선택사항)
            </span>
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Calendar
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="taskDueDateInput"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="tabular-nums min-h-[44px] w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/20"
              />
            </div>
            <button
              type="button"
              onClick={() => setDueDate('')}
              disabled={!dueDate}
              aria-label="마감일 지우기"
              className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span>비우기</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-1 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>업무 추가하기</span>
        </button>
      </form>
    </section>
  );
};
