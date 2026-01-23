import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, User, ViewType, TaskStatus } from '../types';
import { supabase } from '../lib/supabase';

// Filter type
export interface TaskFilter {
    developerId: string | null;
    status: TaskStatus | null;
}

interface TaskStore {
    // Data
    users: User[];
    tasks: Task[];
    isLoading: boolean;

    // UI State
    currentView: ViewType;
    hideCompleted: boolean;
    selectedTask: Task | null;
    isModalOpen: boolean;
    isUserModalOpen: boolean;
    filter: TaskFilter;

    // Actions - Data Fetching
    fetchInitialData: () => Promise<void>;
    subscribeToRealtime: () => void;
    unsubscribeFromRealtime: () => void;

    // Actions - Tasks
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;

    // Actions - Users
    addUser: (user: Omit<User, 'id' | 'avatar'>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;

    // Actions - UI
    setView: (view: ViewType) => void;
    toggleHideCompleted: () => void;
    setSelectedTask: (task: Task | null) => void;
    openModal: (task?: Task) => void;
    closeModal: () => void;
    openUserModal: () => void;
    closeUserModal: () => void;
    setFilter: (filter: Partial<TaskFilter>) => void;
    clearFilter: () => void;

    // Getters
    getDevelopers: () => User[];
    getTasksByDeveloper: (developerId: string) => Task[];
    getTasksByStatus: (status: Task['status']) => Task[];
    getWorkloadByDeveloper: (developerId: string) => { todo: number; inProgress: number; done: number };
    getFilteredTasks: () => Task[];
}

// Helpers for Data Mapping
const mapTaskFromDb = (dbTask: any): Task => ({
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || '',
    srNo: dbTask.sr_no || '',
    requester: dbTask.requester || '',
    status: dbTask.status as TaskStatus,
    assigneeId: dbTask.assignee_id || '',
    createdBy: dbTask.created_by || '',
    startDate: dbTask.start_date || '',
    dueDate: dbTask.due_date || '',
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at,
});

const mapUserFromDb = (dbUser: any): User => ({
    id: dbUser.id,
    name: dbUser.name,
    role: dbUser.role,
    avatar: dbUser.avatar || '',
});

export const useTaskStore = create<TaskStore>()(
    persist(
        (set, get) => ({
            // Initial Data
            users: [],
            tasks: [],
            isLoading: false,

            // Initial UI State
            currentView: 'gantt',
            hideCompleted: false,
            selectedTask: null,
            isModalOpen: false,
            isUserModalOpen: false,
            filter: { developerId: null, status: null },

            // Fetch Data
            fetchInitialData: async () => {
                set({ isLoading: true });
                try {
                    const [tasksResponse, usersResponse] = await Promise.all([
                        supabase.from('tasks').select('*').order('created_at', { ascending: true }),
                        supabase.from('users').select('*').order('created_at', { ascending: true })
                    ]);

                    if (tasksResponse.error) throw tasksResponse.error;
                    if (usersResponse.error) throw usersResponse.error;

                    set({
                        tasks: (tasksResponse.data || []).map(mapTaskFromDb),
                        users: (usersResponse.data || []).map(mapUserFromDb),
                    });
                } catch (error) {
                    console.error('Failed to fetch initial data:', error);
                } finally {
                    set({ isLoading: false });
                }
            },

            subscribeToRealtime: () => {
                const subscription = supabase
                    .channel('public:db_changes')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                        const { old, new: newTask, eventType } = payload;
                        set((state) => {
                            if (eventType === 'INSERT') {
                                return { tasks: [...state.tasks, mapTaskFromDb(newTask)] };
                            } else if (eventType === 'UPDATE') {
                                return {
                                    tasks: state.tasks.map((t) =>
                                        t.id === newTask.id ? mapTaskFromDb(newTask) : t
                                    ),
                                };
                            } else if (eventType === 'DELETE') {
                                return { tasks: state.tasks.filter((t) => t.id !== old.id) };
                            }
                            return state;
                        });
                    })
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
                        const { old, new: newUser, eventType } = payload;
                        set((state) => {
                            if (eventType === 'INSERT') {
                                return { users: [...state.users, mapUserFromDb(newUser)] };
                            } else if (eventType === 'UPDATE') {
                                return {
                                    users: state.users.map((u) =>
                                        u.id === newUser.id ? mapUserFromDb(newUser) : u
                                    ),
                                };
                            } else if (eventType === 'DELETE') {
                                return { users: state.users.filter((u) => u.id !== old.id) };
                            }
                            return state;
                        });
                    })
                    .subscribe();

                // Store subscription cleanup if needed, but zustand store is usually global
            },

            unsubscribeFromRealtime: () => {
                supabase.removeAllChannels();
            },

            // Task Actions
            addTask: async (taskData) => {
                const dbTask = {
                    title: taskData.title,
                    description: taskData.description,
                    sr_no: taskData.srNo,
                    requester: taskData.requester,
                    status: taskData.status,
                    assignee_id: taskData.assigneeId || null,
                    created_by: taskData.createdBy || null,
                    start_date: taskData.startDate || null,
                    due_date: taskData.dueDate || null,
                };

                const { data, error } = await supabase.from('tasks').insert(dbTask).select().single();
                if (error) {
                    console.error('Error adding task:', error);
                    return;
                }
                if (data) {
                    const newTask = mapTaskFromDb(data);
                    set((state) => ({ tasks: [...state.tasks, newTask] }));
                }
            },

            updateTask: async (id, updates) => {
                // Map camelCase updates to snake_case for DB
                const dbUpdates: any = {};
                if (updates.title !== undefined) dbUpdates.title = updates.title;
                if (updates.description !== undefined) dbUpdates.description = updates.description;
                if (updates.srNo !== undefined) dbUpdates.sr_no = updates.srNo;
                if (updates.requester !== undefined) dbUpdates.requester = updates.requester;
                if (updates.status !== undefined) dbUpdates.status = updates.status;
                if (updates.assigneeId !== undefined) dbUpdates.assignee_id = updates.assigneeId || null;
                if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate || null;
                if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate || null;

                dbUpdates.updated_at = new Date().toISOString();

                const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
                if (error) console.error('Error updating task:', error);
            },

            updateTaskStatus: async (id, status) => {
                const { error } = await supabase.from('tasks').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
                if (error) console.error('Error updating task status:', error);
            },

            deleteTask: async (id) => {
                const { error } = await supabase.from('tasks').delete().eq('id', id);
                if (error) {
                    console.error('Error deleting task:', error);
                    return;
                }
                set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
            },

            addUser: async (userData) => {
                const dbUser = {
                    name: userData.name,
                    role: userData.role,
                    avatar: '/avatars/default.png',
                };
                const { data, error } = await supabase.from('users').insert(dbUser).select().single();
                if (error) {
                    console.error('Error adding user:', error);
                    return;
                }
                if (data) {
                    const newUser = mapUserFromDb(data);
                    set((state) => ({ users: [...state.users, newUser] }));
                }
            },

            deleteUser: async (id) => {
                const { error } = await supabase.from('users').delete().eq('id', id);
                if (error) {
                    console.error('Error deleting user:', error);
                    return;
                }
                set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
            },

            // UI Actions
            setView: (view) => set({ currentView: view }),

            toggleHideCompleted: () => set((state) => ({ hideCompleted: !state.hideCompleted })),

            setSelectedTask: (task) => set({ selectedTask: task }),

            openModal: (task) => set({ selectedTask: task || null, isModalOpen: true }),

            closeModal: () => set({ selectedTask: null, isModalOpen: false }),

            openUserModal: () => set({ isUserModalOpen: true }),

            closeUserModal: () => set({ isUserModalOpen: false }),

            setFilter: (newFilter) => set((state) => ({
                filter: { ...state.filter, ...newFilter }
            })),

            clearFilter: () => set({ filter: { developerId: null, status: null } }),

            // Getters
            getDevelopers: () => get().users.filter((user) => user.role === 'developer'),

            getTasksByDeveloper: (developerId) =>
                get().tasks.filter((task) => task.assigneeId === developerId),

            getTasksByStatus: (status) =>
                get().tasks.filter((task) => task.status === status),

            getWorkloadByDeveloper: (developerId) => {
                const tasks = get().tasks.filter((task) => task.assigneeId === developerId);
                return {
                    todo: tasks.filter((t) => t.status === 'todo').length,
                    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
                    done: tasks.filter((t) => t.status === 'done').length,
                };
            },

            getFilteredTasks: () => {
                const { tasks, filter, hideCompleted } = get();
                return tasks.filter((task) => {
                    // Hide completed filter
                    if (hideCompleted && (task.status === 'done' || task.status === 'archived')) {
                        return false;
                    }
                    // Developer filter
                    if (filter.developerId && task.assigneeId !== filter.developerId) {
                        return false;
                    }
                    // Status filter
                    if (filter.status && task.status !== filter.status) {
                        return false;
                    }
                    return true;
                });
            },
        }),
        {
            name: 'erns-pms-storage',
            partialize: (state) => ({
                currentView: state.currentView,
                hideCompleted: state.hideCompleted,
                filter: state.filter, // also persist filter preference?
            }),
        }
    )
);
