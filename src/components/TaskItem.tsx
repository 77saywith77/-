import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { Task, TaskPriority } from '../types/task';

interface TaskItemProps {
  task: Task;
  todayStr: string;
  isEditing: boolean;
  onToggleComplete: (id: string) => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (
    id: string,
    title: string,
    priority: TaskPriority,
    dueDate: string
  ) => void;
  onDelete: (id: string) => void;
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

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  todayStr,
  isEditing,
  onToggleComplete,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}) => {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate);
  const [editError, setEditError] = useState('');

  const editTitleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditTitle(task.title);
      setEditPriority(task.priority);
      setEditDueDate(task.dueDate);
      setEditError('');
      editTitleInputRef.current?.focus();
    }
  }, [isEditing, task]);

  const isOverdue = Boolean(
    !task.completed && task.dueDate && task.dueDate < todayStr
  );
  const isDueToday = Boolean(
    !task.completed && task.dueDate && task.dueDate === todayStr
  );

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setEditError('공백만 입력할 수 없습니다. 업무명을 입력해 주세요.');
      editTitleInputRef.current?.focus();
      return;
    }
    onSaveEdit(task.id, trimmed, editPriority, editDueDate);
  };

  if (isEditing) {
    const titleInputId = `edit-title-${task.id}`;
    const dateInputId = `edit-date-${task.id}`;

    return (
      <li className="border-b border-slate-200 bg-slate-50/70 px-4 py-4 last:border-b-0 sm:px-5">
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-3.5" noValidate>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={titleInputId}
              className="text-sm font-semibold text-slate-900"
            >
              업무명 수정
            </label>
            <input
              ref={editTitleInputRef}
              id={titleInputId}
              type="text"
              value={editTitle}
              maxLength={150}
              onChange={(e) => {
                setEditTitle(e.target.value);
                if (e.target.value.trim() !== '' && editError) {
                  setEditError('');
                }
              }}
              aria-invalid={Boolean(editError)}
              className={`min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2 text-base text-slate-900 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/20 ${
                editError
                  ? 'border-red-600 focus:border-red-600'
                  : 'border-slate-300 focus:border-blue-600'
              }`}
            />
            {editError && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {editError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-slate-900">
                우선순위
              </span>
              <div
                role="radiogroup"
                aria-label="업무 우선순위 수정"
                className="grid grid-cols-3 gap-1.5"
              >
                {PRIORITY_OPTIONS.map((opt, idx) => {
                  const isSelected = editPriority === opt.value;
                  const radioId = `edit-prio-${task.id}-${idx}`;
                  return (
                    <div key={opt.value} className="relative">
                      <input
                        id={radioId}
                        type="radio"
                        name={`editPriority-${task.id}`}
                        value={opt.value}
                        checked={isSelected}
                        onChange={() => setEditPriority(opt.value)}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={radioId}
                        className={`flex min-h-[44px] cursor-pointer items-center justify-center gap-1 rounded-lg border px-2 py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 select-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-1 ${
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
                htmlFor={dateInputId}
                className="text-sm font-semibold text-slate-900"
              >
                마감일{' '}
                <span className="text-xs font-medium text-slate-500">
                  (선택사항)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={dateInputId}
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="tabular-nums min-h-[44px] flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/20"
                />
                <button
                  type="button"
                  onClick={() => setEditDueDate('')}
                  disabled={!editDueDate}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>비우기</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              취소
            </button>
            <button
              type="submit"
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
            >
              저장
            </button>
          </div>
        </form>
      </li>
    );
  }

  const priorityColorClass =
    task.priority === '높음'
      ? 'text-red-700'
      : task.priority === '낮음'
      ? 'text-slate-600'
      : 'text-blue-700';

  return (
    <li
      className={`border-b border-slate-200 px-4 py-4 last:border-b-0 transition-colors duration-150 sm:px-5 ${
        task.completed
          ? 'bg-slate-50/70'
          : isOverdue
          ? 'bg-red-50/40'
          : 'bg-white hover:bg-slate-50/50'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <label className="flex min-h-[40px] min-w-[36px] shrink-0 cursor-pointer items-center justify-center -ml-1.5 -mt-1">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task.id)}
              aria-label={`${task.title}${
                task.completed ? ' 완료 해제' : ' 완료로 표시'
              }`}
              className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 accent-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
            />
          </label>

          <div className="min-w-0 flex-1">
            <p
              className={`text-base font-semibold leading-snug break-words ${
                task.completed
                  ? 'text-slate-400 line-through font-medium'
                  : 'text-slate-900'
              }`}
            >
              {task.title}
            </p>

            {/* Unboxed inline metadata with typographic separators and explicit text+icon status */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-600">
              <span
                className={`inline-flex items-center gap-1 font-semibold ${priorityColorClass}`}
              >
                <Flag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>우선순위: {task.priority}</span>
              </span>

              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>

              <span className="tabular-nums inline-flex items-center gap-1 text-slate-600">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <span>
                  {task.dueDate ? `마감일: ${task.dueDate}` : '마감일 없음'}
                </span>
              </span>

              {task.completed && (
                <>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>완료됨</span>
                  </span>
                </>
              )}

              {isOverdue && (
                <>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-red-700">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>기한 지남</span>
                  </span>
                </>
              )}

              {isDueToday && (
                <>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                    <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>오늘 마감</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 pl-9 sm:pl-0">
          <button
            type="button"
            onClick={() => onStartEdit(task.id)}
            aria-label={`${task.title} 수정`}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            <span>수정</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label={`${task.title} 삭제`}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>삭제</span>
          </button>
        </div>
      </div>
    </li>
  );
};
