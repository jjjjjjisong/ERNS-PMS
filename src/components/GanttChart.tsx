import { useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Task, STATUS_CONFIG } from '../types';
import { format, eachDayOfInterval, parseISO, startOfWeek, endOfWeek, addWeeks, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

export function GanttChart() {
    const { tasks, getDevelopers, hideCompleted, openModal, getFilteredTasks, filter } = useTaskStore();
    const developers = getDevelopers();

    // Calculate date range (4 weeks view)
    const dateRange = useMemo(() => {
        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 1 });
        const end = endOfWeek(addWeeks(now, 3), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, []);

    // Filter tasks - using store's getFilteredTasks for developer/status filtering
    const filteredTasks = useMemo(() => {
        return getFilteredTasks().filter(task => task.status !== 'archived');
    }, [tasks, hideCompleted, filter, getFilteredTasks]);

    // Get tasks for a specific developer
    const getDevTasks = (devId: string) => {
        return filteredTasks.filter(task => task.assigneeId === devId);
    };

    // Get task position info
    const getTaskPosition = (task: Task) => {
        const taskStart = parseISO(task.startDate);
        const taskEnd = parseISO(task.dueDate);
        const rangeStart = dateRange[0];

        const startOffset = Math.max(0, differenceInDays(taskStart, rangeStart));
        const endOffset = Math.min(dateRange.length - 1, differenceInDays(taskEnd, rangeStart));
        const duration = endOffset - startOffset + 1;

        return { startOffset, duration };
    };

    // Today indicator index
    const todayIndex = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dateRange.findIndex(date => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });
    }, [dateRange]);

    return (
        <div className="card overflow-hidden">
            {/* Chart Container */}
            <div className="overflow-x-auto">
                <div className="min-w-[1200px]">
                    {/* Header Row - Dates */}
                    <div className="flex border-b border-surface-200">
                        {/* Developer Column Header */}
                        <div className="w-52 flex-shrink-0 p-5 bg-surface-50 border-r border-surface-200">
                            <span className="font-semibold text-surface-700">개발자</span>
                        </div>

                        {/* Date Headers */}
                        <div className="flex-1 flex">
                            {dateRange.map((date, idx) => {
                                const isToday = idx === todayIndex;
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                                return (
                                    <div
                                        key={date.toISOString()}
                                        className={`flex-1 min-w-[44px] p-2.5 text-center border-r border-surface-100 last:border-r-0
                      ${isToday ? 'bg-primary-50' : isWeekend ? 'bg-surface-50' : 'bg-white'}
                    `}
                                    >
                                        <div className={`text-xs font-medium ${isToday ? 'text-primary-600' : isWeekend ? 'text-surface-400' : 'text-surface-500'}`}>
                                            {format(date, 'EEE', { locale: ko })}
                                        </div>
                                        <div className={`text-sm font-semibold ${isToday ? 'text-primary-700' : 'text-surface-700'}`}>
                                            {format(date, 'd')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Developer Rows */}
                    {developers.map((dev) => {
                        const devTasks = getDevTasks(dev.id);

                        return (
                            <div key={dev.id} className="flex border-b border-surface-100 last:border-b-0 min-h-[90px]">
                                {/* Developer Info */}
                                <div className="w-52 flex-shrink-0 p-5 bg-surface-50 border-r border-surface-200 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-soft">
                                        {dev.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-surface-800">{dev.name}</div>
                                        <div className="text-xs text-surface-500">{devTasks.length}건</div>
                                    </div>
                                </div>

                                {/* Task Grid */}
                                <div className="flex-1 relative">
                                    {/* Background Grid */}
                                    <div className="absolute inset-0 flex">
                                        {dateRange.map((date, idx) => (
                                            <div
                                                key={date.toISOString()}
                                                className={`flex-1 min-w-[44px] border-r border-surface-100 last:border-r-0
                          ${idx === todayIndex ? 'bg-primary-50/50' : date.getDay() === 0 || date.getDay() === 6 ? 'bg-surface-50/50' : ''}
                        `}
                                            />
                                        ))}
                                    </div>

                                    {/* Task Bars */}
                                    <div className="relative p-3 space-y-1.5">
                                        {devTasks.map((task) => {
                                            const pos = getTaskPosition(task);
                                            const isCompleted = task.status === 'done' || task.status === 'archived';
                                            const statusConfig = STATUS_CONFIG[task.status];

                                            // Calculate actual left position and width
                                            const cellWidth = 44; // min-w-[44px]
                                            const leftPx = pos.startOffset * cellWidth;
                                            const widthPx = pos.duration * cellWidth;

                                            return (
                                                <div
                                                    key={task.id}
                                                    onClick={() => openModal(task)}
                                                    className={`absolute h-9 rounded-lg cursor-pointer transition-all group hover:z-10 shadow-soft
                            ${isCompleted ? 'opacity-50' : 'opacity-100'}
                            ${task.status === 'todo' ? 'bg-gradient-to-r from-surface-500 to-surface-400' : ''}
                            ${task.status === 'in-progress' ? 'bg-gradient-to-r from-blue-500 to-blue-400' : ''}
                            ${task.status === 'done' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : ''}
                            ${task.status === 'archived' ? 'bg-gradient-to-r from-surface-400 to-surface-300' : ''}
                            hover:shadow-soft-lg hover:scale-[1.02] hover:-translate-y-0.5
                          `}
                                                    style={{
                                                        left: `${leftPx}px`,
                                                        width: `${Math.max(widthPx - 4, 40)}px`,
                                                        top: `${devTasks.indexOf(task) * 40 + 12}px`,
                                                    }}
                                                >
                                                    <div className="h-full px-3 flex items-center overflow-hidden">
                                                        <span className="text-xs font-medium text-white truncate">
                                                            {task.title}
                                                        </span>
                                                    </div>

                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                                        <div className="bg-white border border-surface-200 rounded-xl p-4 shadow-soft-xl min-w-[220px]">
                                                            <div className="font-semibold text-surface-800 text-sm mb-1">{task.title}</div>
                                                            <div className="text-xs text-surface-400 font-mono mb-3">{task.srNo}</div>
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <span className={`px-2.5 py-1 rounded-full font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                                                                    {statusConfig.label}
                                                                </span>
                                                                <span className="text-surface-500">
                                                                    {format(parseISO(task.startDate), 'M/d')} - {format(parseISO(task.dueDate), 'M/d')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="p-5 border-t border-surface-200 bg-surface-50 flex items-center justify-center gap-8">
                {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).slice(0, 3).map((status) => (
                    <div key={status} className="flex items-center gap-2.5">
                        <div className={`w-3.5 h-3.5 rounded-md ${status === 'todo' ? 'bg-surface-500' :
                            status === 'in-progress' ? 'bg-blue-500' :
                                'bg-emerald-500'
                            }`} />
                        <span className="text-xs text-surface-600 font-medium">{STATUS_CONFIG[status].label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
