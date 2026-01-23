import { useTaskStore } from '../store/useTaskStore';
import { TaskStatus } from '../types';

export function WorkloadSummary() {
    const { getDevelopers, getWorkloadByDeveloper, filter, setFilter, clearFilter } = useTaskStore();
    const developers = getDevelopers();

    const handleFilterClick = (developerId: string, status: TaskStatus) => {
        // If clicking on the same filter, clear it
        if (filter.developerId === developerId && filter.status === status) {
            clearFilter();
        } else {
            setFilter({ developerId, status });
        }
    };

    const isActive = (developerId: string, status: TaskStatus) => {
        return filter.developerId === developerId && filter.status === status;
    };

    return (
        <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-surface-800 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-sm">👥</span>
                    <span>개발자 업무 현황</span>
                </h2>
                {(filter.developerId || filter.status) && (
                    <button
                        onClick={clearFilter}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                        <span>✕</span>
                        <span>필터 해제</span>
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {developers.map((dev) => {
                    const workload = getWorkloadByDeveloper(dev.id);
                    const totalActive = workload.todo + workload.inProgress;

                    return (
                        <div
                            key={dev.id}
                            className="bg-surface-50 rounded-xl p-5 border border-surface-200 hover:border-surface-300 transition-all"
                        >
                            <button
                                onClick={() => {
                                    if (filter.developerId === dev.id && filter.status === null) {
                                        clearFilter();
                                    } else {
                                        setFilter({ developerId: dev.id, status: null });
                                    }
                                }}
                                className={`w-full flex items-center gap-4 mb-4 text-left p-2 -m-2 rounded-lg transition-colors ${filter.developerId === dev.id && filter.status === null ? 'bg-primary-50 ring-1 ring-primary-200' : 'hover:bg-surface-100'}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-base shadow-soft-md">
                                    {dev.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-surface-800 text-base">{dev.name}</h3>
                                    <p className="text-sm text-surface-500">
                                        활성 업무 <span className="font-medium text-surface-700">{totalActive}</span>건
                                    </p>
                                </div>
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleFilterClick(dev.id, 'todo')}
                                    className={`flex-1 rounded-xl p-3 text-center transition-all cursor-pointer border-2
                    ${isActive(dev.id, 'todo')
                                            ? 'bg-surface-600 border-surface-700 shadow-soft-md'
                                            : 'bg-surface-100 border-transparent hover:bg-surface-200 hover:border-surface-300'}`}
                                >
                                    <div className={`text-xl font-bold ${isActive(dev.id, 'todo') ? 'text-white' : 'text-surface-700'}`}>
                                        {workload.todo}
                                    </div>
                                    <div className={`text-xs font-medium ${isActive(dev.id, 'todo') ? 'text-surface-200' : 'text-surface-500'}`}>할 일</div>
                                </button>
                                <button
                                    onClick={() => handleFilterClick(dev.id, 'in-progress')}
                                    className={`flex-1 rounded-xl p-3 text-center transition-all cursor-pointer border-2
                    ${isActive(dev.id, 'in-progress')
                                            ? 'bg-blue-500 border-blue-600 shadow-soft-md'
                                            : 'bg-blue-50 border-transparent hover:bg-blue-100 hover:border-blue-200'}`}
                                >
                                    <div className={`text-xl font-bold ${isActive(dev.id, 'in-progress') ? 'text-white' : 'text-blue-600'}`}>
                                        {workload.inProgress}
                                    </div>
                                    <div className={`text-xs font-medium ${isActive(dev.id, 'in-progress') ? 'text-blue-100' : 'text-surface-500'}`}>진행 중</div>
                                </button>
                                <button
                                    onClick={() => handleFilterClick(dev.id, 'done')}
                                    className={`flex-1 rounded-xl p-3 text-center transition-all cursor-pointer border-2
                    ${isActive(dev.id, 'done')
                                            ? 'bg-emerald-500 border-emerald-600 shadow-soft-md'
                                            : 'bg-emerald-50 border-transparent hover:bg-emerald-100 hover:border-emerald-200'}`}
                                >
                                    <div className={`text-xl font-bold ${isActive(dev.id, 'done') ? 'text-white' : 'text-emerald-600'}`}>
                                        {workload.done}
                                    </div>
                                    <div className={`text-xs font-medium ${isActive(dev.id, 'done') ? 'text-emerald-100' : 'text-surface-500'}`}>완료</div>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div >
    );
}
