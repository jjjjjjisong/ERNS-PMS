import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Task, TaskStatus, STATUS_CONFIG } from '../types';

export function TaskModal() {
    const { isModalOpen, closeModal, selectedTask, addTask, updateTask, users, getDevelopers } = useTaskStore();
    const developers = getDevelopers();
    const planners = users.filter(u => u.role === 'planner');

    const [formData, setFormData] = useState({
        title: '',
        srNo: '',
        description: '',
        requester: '',
        assigneeId: '',
        startDate: '',
        dueDate: '',
        status: 'todo' as TaskStatus,
        createdBy: '',
    });

    useEffect(() => {
        if (isModalOpen) {
            if (selectedTask) {
                setFormData({
                    title: selectedTask.title,
                    srNo: selectedTask.srNo,
                    description: selectedTask.description,
                    requester: selectedTask.requester || '',
                    assigneeId: selectedTask.assigneeId,
                    startDate: selectedTask.startDate,
                    dueDate: selectedTask.dueDate,
                    status: selectedTask.status,
                    createdBy: selectedTask.createdBy,
                });
            } else {
                setFormData({
                    title: '',
                    srNo: '',
                    description: '',
                    requester: '',
                    assigneeId: developers[0]?.id || '',
                    startDate: '',
                    dueDate: '',
                    status: 'todo',
                    createdBy: planners[0]?.id || '',
                });
            }
        }
    }, [selectedTask, isModalOpen]);

    if (!isModalOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedTask) {
            updateTask(selectedTask.id, formData);
        } else {
            addTask(formData as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
        }

        closeModal();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            {/* Modal - Light Theme */}
            <div className="relative w-full max-w-xl bg-white rounded-2xl border border-surface-200 shadow-soft-xl animate-scale-in max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-surface-200 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-surface-800">
                        {selectedTask ? '업무 수정' : '새 업무 만들기'}
                    </h2>
                    <button
                        type="button"
                        onClick={closeModal}
                        className="w-8 h-8 rounded-lg bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-surface-500 hover:text-surface-700 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title & SR No */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="title" className="label">업무명 *</label>
                            <input
                                id="title"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                required
                                autoComplete="off"
                                className="input-field"
                                placeholder="업무 제목을 입력하세요"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="requester" className="label">요청자</label>
                            <input
                                id="requester"
                                type="text"
                                name="requester"
                                value={formData.requester}
                                onChange={(e) => setFormData(prev => ({ ...prev, requester: e.target.value }))}
                                autoComplete="off"
                                className="input-field"
                                placeholder="법인명-담당자명"
                            />
                        </div>
                        <div>
                            <label htmlFor="srNo" className="label">SR No</label>
                            <input
                                id="srNo"
                                type="text"
                                name="srNo"
                                value={formData.srNo}
                                onChange={(e) => setFormData(prev => ({ ...prev, srNo: e.target.value }))}
                                autoComplete="off"
                                className="input-field"
                                placeholder="SR번호를 직접 입력하세요"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="label">설명</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="input-field resize-none"
                            placeholder="업무에 대한 상세 설명을 입력하세요"
                        />
                    </div>

                    {/* Assignee & Creator */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="assigneeId" className="label">담당자 (개발자)</label>
                            <select
                                id="assigneeId"
                                name="assigneeId"
                                value={formData.assigneeId}
                                onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                                className="input-field"
                            >
                                <option value="">선택 안함</option>
                                {developers.map(dev => (
                                    <option key={dev.id} value={dev.id}>{dev.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="createdBy" className="label">생성자 (기획자)</label>
                            <select
                                id="createdBy"
                                name="createdBy"
                                value={formData.createdBy}
                                onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
                                className="input-field"
                            >
                                <option value="">선택 안함</option>
                                {planners.map(planner => (
                                    <option key={planner.id} value={planner.id}>{planner.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="label">시작일</label>
                            <input
                                id="startDate"
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="label">마감일</label>
                            <input
                                id="dueDate"
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                className="input-field"
                            />
                        </div>
                    </div>

                    {/* Status (only for edit) */}
                    {selectedTask && (
                        <div>
                            <label className="label">상태</label>
                            <div className="flex flex-wrap gap-2">
                                {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, status }))}
                                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all 
                      ${formData.status === status
                                                ? `${status === 'todo' ? 'bg-surface-600 text-white' :
                                                    status === 'in-progress' ? 'bg-blue-500 text-white' :
                                                        status === 'done' ? 'bg-emerald-500 text-white' :
                                                            'bg-surface-500 text-white'} ring-2 ring-offset-2 ring-current`
                                                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                                            }`}
                                    >
                                        {STATUS_CONFIG[status].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-5 border-t border-surface-200">
                        <button type="button" onClick={closeModal} className="btn-secondary">
                            취소
                        </button>
                        <button type="submit" className="btn-primary">
                            {selectedTask ? '수정하기' : '생성하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
