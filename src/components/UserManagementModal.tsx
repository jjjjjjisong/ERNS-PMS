import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { UserRole } from '../types';

export function UserManagementModal() {
    const { isUserModalOpen, closeUserModal, users, addUser, deleteUser } = useTaskStore();
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('developer');
    const [isDevelopersOpen, setIsDevelopersOpen] = useState(true);
    const [isPlannersOpen, setIsPlannersOpen] = useState(true);

    if (!isUserModalOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        addUser({
            name: name.trim(),
            role,
        });

        setName('');
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            closeUserModal();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="relative w-[520px] h-[650px] bg-white rounded-2xl border border-surface-200 shadow-soft-xl animate-scale-in flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-surface-100 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-surface-900">인원 관리</h2>
                        <p className="text-xs text-surface-500 mt-1">프로젝트 멤버를 추가하거나 삭제합니다</p>
                    </div>
                    <button
                        onClick={closeUserModal}
                        className="p-2 -mr-2 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-50 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col p-6 min-h-0">
                    {/* Add User Form */}
                    <form onSubmit={handleSubmit} className="flex gap-2 mb-6 shrink-0">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="input-field w-28 shrink-0"
                        >
                            <option value="developer">개발자</option>
                            <option value="planner">기획자</option>
                        </select>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름 입력"
                            className="input-field flex-1"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="btn-primary whitespace-nowrap px-4"
                        >
                            추가
                        </button>
                    </form>

                    {/* User List */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 customer-scrollbar">
                        {/* Developers */}
                        <div>
                            <button
                                onClick={() => setIsDevelopersOpen(!isDevelopersOpen)}
                                className="w-full flex items-center justify-between group mb-2 sticky top-0 bg-white z-10 py-1"
                            >
                                <h3 className="text-xs font-bold text-surface-900 flex items-center gap-2">
                                    <span>👨‍💻 개발자</span>
                                    <span className="text-surface-400 font-normal">({users.filter(u => u.role === 'developer').length})</span>
                                </h3>
                                <span className={`text-surface-400 transition-transform duration-200 ${isDevelopersOpen ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {isDevelopersOpen && (
                                <div className="space-y-2 animate-fade-in">
                                    {users.filter(u => u.role === 'developer').map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-50 border border-surface-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-[10px] shadow-soft">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-surface-700">{user.name}</span>
                                            </div>
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    ))}
                                    {users.filter(u => u.role === 'developer').length === 0 && (
                                        <p className="text-xs text-surface-400 p-2 text-center">등록된 개발자가 없습니다</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Planners */}
                        <div>
                            <button
                                onClick={() => setIsPlannersOpen(!isPlannersOpen)}
                                className="w-full flex items-center justify-between group mb-2 sticky top-0 bg-white z-10 py-1"
                            >
                                <h3 className="text-xs font-bold text-surface-900 flex items-center gap-2">
                                    <span>📅 기획자</span>
                                    <span className="text-surface-400 font-normal">({users.filter(u => u.role === 'planner').length})</span>
                                </h3>
                                <span className={`text-surface-400 transition-transform duration-200 ${isPlannersOpen ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {isPlannersOpen && (
                                <div className="space-y-2 animate-fade-in pb-2">
                                    {users.filter(u => u.role === 'planner').map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-50 border border-surface-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-[10px] shadow-soft">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-surface-700">{user.name}</span>
                                            </div>
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    ))}
                                    {users.filter(u => u.role === 'planner').length === 0 && (
                                        <p className="text-xs text-surface-400 p-2 text-center">등록된 기획자가 없습니다</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
