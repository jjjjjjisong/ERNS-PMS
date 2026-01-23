import { useTaskStore } from '../store/useTaskStore';

export function Header() {
    const { isUserModalOpen, openUserModal, currentView, setView, openModal } = useTaskStore();

    return (
        <header className="h-16 border-b border-surface-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-8 h-full flex items-center justify-between">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setView('kanban')}
                >
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                        <span className="text-white text-lg font-bold">E</span>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-surface-900 to-surface-600 bg-clip-text text-transparent">
                        ERNS 업무 배분
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setView(currentView === 'archive' ? 'kanban' : 'archive')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 border
              ${currentView === 'archive'
                                ? 'bg-surface-100 text-surface-900 border-surface-200 font-bold'
                                : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300 hover:bg-surface-50'}`}
                    >
                        <span>📦</span>
                        <span className="text-sm font-medium">보관함</span>
                    </button>

                    <button
                        onClick={openUserModal}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 border
              ${isUserModalOpen
                                ? 'bg-surface-100 text-surface-900 border-surface-200 font-bold'
                                : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300 hover:bg-surface-50'}`}
                    >
                        <span>👥</span>
                        <span className="text-sm font-medium">인원 관리</span>
                    </button>

                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all duration-200 font-medium active:scale-95"
                    >
                        <span>+</span>
                        <span>새 업무</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
