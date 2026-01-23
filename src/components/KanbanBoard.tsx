import { useMemo } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Task, TaskStatus, STATUS_CONFIG } from '../types';
import { format, parseISO, isPast } from 'date-fns';

// Kanban Column Configuration
const KANBAN_COLUMNS: { status: TaskStatus; title: string; icon: string }[] = [
    { status: 'todo', title: '할 일', icon: '📋' },
    { status: 'in-progress', title: '진행 중', icon: '🔄' },
    { status: 'done', title: '완료', icon: '✅' },
];

// Helper to separate truncation logic
const truncateByByte = (str: string, maxBytes: number) => {
    let byteLength = 0;
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        const charBytes = code > 127 ? 2 : 1;
        if (byteLength + charBytes > maxBytes) {
            return result + '...';
        }
        byteLength += charBytes;
        result += str[i];
    }
    return result;
};

// Sortable Task Card Component
function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const { users } = useTaskStore();
    const assignee = users.find(u => u.id === task.assigneeId);
    const creator = users.find(u => u.id === task.createdBy);
    const isOverdue = task.dueDate ? isPast(parseISO(task.dueDate)) && task.status !== 'done' : false;



    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`task-card bg-white rounded-xl p-4 border border-surface-200 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 scale-105 shadow-soft-xl' : 'hover:border-surface-300'}
        ${task.status === 'done' ? 'opacity-60' : ''}
      `}
        >
            {/* SR Badge */}
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-surface-400 bg-surface-50 px-2 py-0.5 rounded">{task.srNo}</span>
            </div>

            {/* Title */}
            <h3 className="font-medium text-surface-800 text-sm mb-2 line-clamp-2 leading-relaxed">
                {task.title}
            </h3>

            {/* Description */}
            {task.description && (
                <p className="text-xs text-surface-500 mb-4 line-clamp-2 leading-relaxed">
                    {task.description}
                </p>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-surface-100 space-y-2">
                {/* Date Range Display */}
                {(task.startDate || task.dueDate) && (
                    <div className="flex items-center gap-1.5 text-xs text-surface-500 bg-surface-50 p-2 rounded-lg">
                        <span className="text-surface-400">📅</span>
                        <span>
                            {task.startDate ? format(parseISO(task.startDate), 'yyyy.MM.dd') : '...'}
                            {' ~ '}
                            {task.dueDate ? format(parseISO(task.dueDate), 'yyyy.MM.dd') : '...'}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-[10px] shadow-soft">
                                {assignee?.name.charAt(0) || '?'}
                            </div>
                            <span className="text-xs text-surface-600 font-medium">{assignee?.name || '미배정'}</span>
                        </div>
                        <span className="text-xs text-surface-300">|</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-[10px] shadow-soft">
                                {creator?.name.charAt(0) || '?'}
                            </div>
                            <span className="text-xs text-surface-500">{creator?.name || '미지정'}</span>
                        </div>
                        {task.requester && (
                            <>
                                <span className="text-xs text-surface-300">|</span>
                                <div className="flex items-center gap-1 text-xs text-surface-500" title={task.requester}>
                                    <span className="text-base leading-none">🏢</span>
                                    <span className="font-medium max-w-[120px] truncate">
                                        {truncateByByte(task.requester, 30)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                    {isOverdue && task.status !== 'done' && (
                        <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded">마감 초과</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// Task Card for Overlay (when dragging)
function TaskCardOverlay({ task }: { task: Task }) {
    const { users } = useTaskStore();
    const assignee = users.find(u => u.id === task.assigneeId);

    return (
        <div className="task-card bg-white rounded-xl p-4 border-2 border-primary-500 shadow-soft-xl cursor-grabbing">
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-surface-400 bg-surface-50 px-2 py-0.5 rounded">{task.srNo}</span>
            </div>
            <h3 className="font-medium text-surface-800 text-sm mb-2">{task.title}</h3>

            {(task.startDate || task.dueDate) && (
                <div className="flex items-center gap-1.5 text-xs text-surface-500 bg-surface-50 p-2 rounded-lg mb-2">
                    <span className="text-surface-400">📅</span>
                    <span>
                        {task.startDate ? format(parseISO(task.startDate), 'yyyy.MM.dd') : '...'}
                        {' ~ '}
                        {task.dueDate ? format(parseISO(task.dueDate), 'yyyy.MM.dd') : '...'}
                    </span>
                </div>
            )}

            <div className="flex items-center gap-2.5 pt-3 border-t border-surface-100">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-[11px]">
                        {assignee?.name.charAt(0)}
                    </div>
                    <span className="text-xs text-surface-600 font-medium">{assignee?.name}</span>
                </div>
                {task.requester && (
                    <>
                        <span className="text-xs text-surface-300">|</span>
                        <div className="flex items-center gap-1 text-xs text-surface-500">
                            <span className="text-sm leading-none">🏢</span>
                            <span className="font-medium max-w-[120px] truncate">
                                {truncateByByte(task.requester, 30)}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Droppable Column Component
function DroppableColumn({
    column,
    tasks,
    openModal
}: {
    column: { status: TaskStatus; title: string; icon: string };
    tasks: Task[];
    openModal: (task: Task) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.status,
    });

    const statusConfig = STATUS_CONFIG[column.status];

    return (
        <div
            ref={setNodeRef}
            className={`card p-5 transition-colors ${isOver ? 'bg-surface-50 ring-2 ring-primary-200' : ''}`}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <span className="text-lg">{column.icon}</span>
                    <h3 className="font-semibold text-surface-800">{column.title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {tasks.length}
                </span>
            </div>

            {/* Tasks Container */}
            <div className="space-y-4 min-h-[200px]">
                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <SortableTaskCard
                                key={task.id}
                                task={task}
                                onClick={() => openModal(task)}
                            />
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-32 border-2 border-dashed border-surface-200 rounded-xl bg-surface-50/50">
                            <p className="text-sm text-surface-400">업무가 없습니다</p>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}

export function KanbanBoard() {
    const { tasks, hideCompleted, updateTaskStatus, openModal, getFilteredTasks, filter, setFilter } = useTaskStore();
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Filter and group tasks by status (using store's getFilteredTasks for developer/status filtering)
    const tasksByStatus = useMemo(() => {
        const filteredTasks = getFilteredTasks();

        // Additional filter for archived tasks
        const filtered = filteredTasks.filter(task => {
            // Don't show archived in kanban
            if (task.status === 'archived') {
                return false;
            }
            return true;
        });

        return KANBAN_COLUMNS.reduce((acc, col) => {
            acc[col.status] = filtered.filter(t => t.status === col.status);
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
    }, [tasks, hideCompleted, filter, getFilteredTasks]);

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id);
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);

        const { active, over } = event;

        if (!over) return;

        const taskId = active.id as string;
        const overId = over.id as string;

        let newStatus: TaskStatus | null = null;

        // Check if dropped on a column
        const targetColumn = KANBAN_COLUMNS.find(col => col.status === overId);
        if (targetColumn) {
            newStatus = targetColumn.status;
        } else {
            // Check if dropped on another task
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (newStatus) {
            // Update status
            updateTaskStatus(taskId, newStatus);

            // If dragging from a specific status filter, clear the status filter only
            // so the user can see the moved task in the new column.
            if (filter.status && filter.status !== newStatus) {
                setFilter({ status: null });
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {KANBAN_COLUMNS.map((column) => (
                    <DroppableColumn
                        key={column.status}
                        column={column}
                        tasks={tasksByStatus[column.status] || []}
                        openModal={openModal}
                    />
                ))}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
