import { useEffect } from 'react';
import { Header } from './components/Header';
import { WorkloadSummary } from './components/WorkloadSummary';
import { KanbanBoard } from './components/KanbanBoard';
import { ArchiveBoard } from './components/ArchiveBoard';
import { TaskModal } from './components/TaskModal';
import { UserManagementModal } from './components/UserManagementModal';
import { useTaskStore } from './store/useTaskStore';

function App() {
    const { isModalOpen, currentView, fetchInitialData, subscribeToRealtime, unsubscribeFromRealtime } = useTaskStore();

    useEffect(() => {
        fetchInitialData();
        subscribeToRealtime();
        return () => unsubscribeFromRealtime();
    }, [fetchInitialData, subscribeToRealtime, unsubscribeFromRealtime]);

    return (
        <div className="min-h-screen bg-surface-50">
            <Header />
            <main className="max-w-[1600px] mx-auto px-8 py-8">
                {currentView === 'archive' ? (
                    <ArchiveBoard />
                ) : (
                    <>
                        <WorkloadSummary />
                        <KanbanBoard />
                    </>
                )}
            </main>
            {isModalOpen && <TaskModal />}
            <UserManagementModal />
        </div>
    );
}

export default App;
