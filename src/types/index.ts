// Role types
// Task status types
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'archived';

// User interface
export type UserRole = 'developer' | 'planner';

export interface User {
    id: string;
    name: string;
    avatar: string;
    role: UserRole;
}

// Task interface
export interface Task {
    id: string;
    title: string;          // 업무명
    srNo: string;           // SR no
    description: string;    // 설명
    requester: string;      // 요청자 (법인명-담당자명)
    assigneeId: string;     // 담당자 (개발자 ID)
    startDate: string;      // 시작일 (ISO string)
    dueDate: string;        // 마감일 (ISO string)
    status: TaskStatus;     // 상태
    createdBy: string;      // 생성자 (기획자 ID)
    createdAt: string;      // 생성일 (ISO string)
    updatedAt: string;      // 수정일 (ISO string)
}

// Status configuration for UI
export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
    'todo': {
        label: '할 일',
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/20'
    },
    'in-progress': {
        label: '진행 중',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20'
    },
    'done': {
        label: '완료',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20'
    },
    'archived': {
        label: '보관됨',
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/20'
    },
};

// View types
export type ViewType = 'gantt' | 'kanban' | 'archive';
