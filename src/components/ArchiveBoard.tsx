import { useTaskStore } from '../store/useTaskStore';
import { format, parseISO } from 'date-fns';
import { Task } from '../types';

export function ArchiveBoard() {
    const { getTasksByStatus, updateTaskStatus, deleteTask } = useTaskStore();
    const archivedTasks = getTasksByStatus('archived');

    const handleRestore = (task: Task) => {
        // Restore to 'todo' by default, or maybe 'in-progress' if it was there? 
        // For simplicity, let's restore to 'todo'
        updateTaskStatus(task.id, 'todo');
    };

    const handleDelete = (taskId: string) => {
        if (confirm('정말로 이 업무를 영구 삭제하시겠습니까?')) {
            deleteTask(taskId);
        }
    };

    return (
        <div className="container mx-auto max-w-5xl">
            <div className="card p-6 min-h-[500px]">
                <div className="flex items-center gap-3 mb-6 border-b border-surface-100 pb-4">
                    <span className="text-2xl">📦</span>
                    <div>
                        <h2 className="text-xl font-bold text-surface-900">보관함</h2>
                        <p className="text-sm text-surface-500">완료된 업무나 취소된 업무를 보관하는 곳입니다</p>
                    </div>
                    <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-surface-100 text-surface-600">
                        Total: {archivedTasks.length}
                    </span>
                </div>

                {archivedTasks.length > 0 ? (
                    <div className="space-y-3">
                        {archivedTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200 hover:border-surface-300 transition-colors group"
                            >
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-surface-400 bg-white px-2 py-0.5 rounded border border-surface-100">
                                            {task.srNo}
                                        </span>
                                        <span className="text-xs text-surface-400">
                                            {format(parseISO(task.updatedAt), 'yyyy.MM.dd HH:mm')} 보관됨
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-surface-800 mb-1 truncate">{task.title}</h3>
                                    {task.description && (
                                        <p className="text-xs text-surface-500 truncate">{task.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleRestore(task)}
                                        className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors border border-transparent"
                                        title="할 일로 복구"
                                    >
                                        복구
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-transparent"
                                        title="영구 삭제"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-surface-400">
                        <span className="text-4xl mb-4 opacity-50">📭</span>
                        <p>보관된 업무가 없습니다</p>
                    </div>
                )}
            </div>
        </div>
    );
}
