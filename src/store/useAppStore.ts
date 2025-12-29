import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Task, Space, List, ViewType, Subtask, Tag, ColumnSetting, Comment, TimeEntry, Relationship, Doc, Status } from '../types';

interface AppStore extends AppState {
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'tags'>) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;
    duplicateTask: (taskId: string) => void;
    archiveTask: (taskId: string) => void;
    addSubtask: (taskId: string, subtask: Omit<Subtask, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
    setSpaces: (spaces: Space[]) => void;
    addSpace: (space: Omit<Space, 'id' | 'taskCount' | 'isDefault'>) => void;
    setLists: (lists: List[]) => void;
    addList: (list: Omit<List, 'id' | 'taskCount'>) => void;
    updateList: (listId: string, updates: Partial<List>) => void;
    deleteList: (listId: string) => void;
    updateSpace: (spaceId: string, updates: Partial<Space>) => void;
    deleteSpace: (spaceId: string) => void;
    setCurrentSpaceId: (spaceId: string) => void;
    setCurrentListId: (listId: string | null) => void;
    setCurrentView: (view: ViewType) => void;
    addTag: (tag: Omit<Tag, 'id'>) => void;
    updateTag: (tagId: string, updates: Partial<Tag>) => void;
    deleteTag: (tagId: string) => void;
    setColumnSettings: (targetId: string, columns: ColumnSetting[]) => void;
    addComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
    addTimeEntry: (taskId: string, entry: Omit<TimeEntry, 'id'>) => void;
    addRelationship: (taskId: string, relationship: Omit<Relationship, 'id'>) => void;
    addDoc: (doc: Omit<Doc, 'id' | 'updatedAt'>) => string;
    updateDoc: (docId: string, updates: Partial<Doc>) => void;
    addStatus: (targetId: string, isSpace: boolean, status: Omit<Status, 'id'>) => void;
    setTheme: (theme: AppState['theme']) => void;
    setAccentColor: (color: string) => void;
}

const DEFAULT_STATUSES: Status[] = [
    { id: 'todo', name: 'TO DO', color: '#3b82f6', type: 'todo' },
    { id: 'inprogress', name: 'IN PROGRESS', color: '#f59e0b', type: 'inprogress' },
    { id: 'completed', name: 'COMPLETED', color: '#10b981', type: 'done' }
];

export const useAppStore = create<AppStore>()(
    persist(
        (set) => ({
            tasks: [
                {
                    id: '1',
                    name: 'Implement Goal tracking',
                    description: 'Create a new feature to track user goals and progress.',
                    status: 'TO DO',
                    priority: 'high',
                    spaceId: 'team-space',
                    assignee: 'Jundee',
                    dueDate: '2025-12-30',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    tags: ['bug'],
                    subtasks: []
                },
                {
                    id: '2',
                    name: 'Design System Update',
                    description: 'Refresh the design system with new tokens and components.',
                    status: 'IN PROGRESS',
                    priority: 'urgent',
                    spaceId: 'team-space',
                    assignee: 'Alice',
                    dueDate: '2025-12-28',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    tags: ['feature'],
                    subtasks: []
                }
            ],
            spaces: [
                { id: 'everything', name: 'Everything', icon: 'star', color: '#3b82f6', isDefault: true, taskCount: 0, statuses: DEFAULT_STATUSES },
                { id: 'team-space', name: 'Team Space', icon: 'users', color: '#10b981', isDefault: true, taskCount: 0, statuses: DEFAULT_STATUSES },
                { id: 'pmnp', name: 'PMNP', icon: 'lock', color: '#f59e0b', isDefault: true, taskCount: 0, statuses: DEFAULT_STATUSES }
            ],
            lists: [
                { id: 'list-1', name: 'Project 1', spaceId: 'team-space', taskCount: 0, icon: 'list', color: '#64748b', statuses: DEFAULT_STATUSES }
            ],
            tags: [
                { id: 'bug', name: 'Bug', color: '#ef4444' },
                { id: 'feature', name: 'Feature', color: '#3b82f6' },
                { id: 'urgent', name: 'Urgent', color: '#f59e0b' }
            ],
            docs: [
                { id: '1', name: 'Project Requirements', content: 'Initial requirements for the project...', userId: 'user-1', userName: 'Jundee', updatedAt: new Date().toISOString(), spaceId: 'team-space' },
            ],
            currentSpaceId: 'team-space',
            currentListId: null,
            currentView: 'home',
            columnSettings: {
                'default': [
                    { id: 'name', name: 'Name', visible: true, width: 300 },
                    { id: 'assignee', name: 'Assignee', visible: true, width: 150 },
                    { id: 'dueDate', name: 'Due Date', visible: true, width: 150 },
                    { id: 'priority', name: 'Priority', visible: true, width: 120 },
                    { id: 'status', name: 'Status', visible: true, width: 120 },
                ]
            },
            theme: 'system',
            accentColor: '#2563eb',

            setTasks: (tasks) => set({ tasks }),
            addTask: (task) => set((state) => ({
                tasks: [
                    {
                        ...task,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        subtasks: [],
                        tags: []
                    },
                    ...state.tasks
                ]
            })),
            updateTask: (taskId, updates) => set((state) => {
                console.log(`Updating task ${taskId}`, updates);
                return {
                    tasks: state.tasks.map((task) =>
                        task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
                    )
                };
            }),
            deleteTask: (taskId) => set((state) => ({
                tasks: state.tasks.filter((task) => task.id !== taskId)
            })),
            duplicateTask: (taskId) => set((state) => {
                const task = state.tasks.find(t => t.id === taskId);
                if (!task) return state;
                const newId = crypto.randomUUID();
                const newTask = {
                    ...task,
                    id: newId,
                    name: `${task.name} (Copy)`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    subtasks: task.subtasks?.map(st => ({ ...st, id: crypto.randomUUID() }))
                };
                return { tasks: [...state.tasks, newTask] };
            }),
            archiveTask: (taskId) => set((state) => ({
                tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'COMPLETED' } : t)
            })),
            addSubtask: (taskId, subtask) => set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === taskId ? {
                        ...task,
                        subtasks: [...(task.subtasks || []), { ...subtask, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
                    } : task
                )
            })),
            updateSubtask: (taskId, subtaskId, updates) => set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === taskId ? {
                        ...task,
                        subtasks: task.subtasks?.map(st => st.id === subtaskId ? { ...st, ...updates, updatedAt: new Date().toISOString() } : st)
                    } : task
                )
            })),
            setSpaces: (spaces) => set({ spaces }),
            addSpace: (space) => set((state) => ({
                spaces: [...state.spaces, { ...space, id: crypto.randomUUID(), taskCount: 0, isDefault: false, statuses: DEFAULT_STATUSES }]
            })),
            setLists: (lists) => set({ lists }),
            addList: (list) => set((state) => ({
                lists: [...state.lists, { ...list, id: crypto.randomUUID(), taskCount: 0, statuses: DEFAULT_STATUSES }]
            })),
            updateList: (listId, updates) => set((state) => ({
                lists: state.lists.map(l => l.id === listId ? { ...l, ...updates } : l)
            })),
            deleteList: (listId) => set((state) => ({
                lists: state.lists.filter(l => l.id !== listId),
                tasks: state.tasks.filter(t => t.listId !== listId)
            })),
            updateSpace: (spaceId, updates) => set((state) => ({
                spaces: state.spaces.map(s => s.id === spaceId ? { ...s, ...updates } : s)
            })),
            deleteSpace: (spaceId) => set((state) => ({
                spaces: state.spaces.filter(s => s.id !== spaceId),
                tasks: state.tasks.filter(t => t.spaceId !== spaceId),
                lists: state.lists.filter(l => l.spaceId !== spaceId)
            })),
            setCurrentSpaceId: (spaceId) => set({ currentSpaceId: spaceId }),
            setCurrentListId: (listId) => set({ currentListId: listId }),
            setCurrentView: (view) => set({ currentView: view }),

            addTag: (tag) => set((state) => ({
                tags: [...state.tags, { ...tag, id: crypto.randomUUID() }]
            })),
            updateTag: (tagId, updates) => set((state) => ({
                tags: state.tags.map(t => t.id === tagId ? { ...t, ...updates } : t)
            })),
            deleteTag: (tagId) => set((state) => ({
                tags: state.tags.filter(t => t.id !== tagId)
            })),
            setColumnSettings: (targetId, columns) => set((state) => ({
                columnSettings: { ...state.columnSettings, [targetId]: columns }
            })),
            addComment: (taskId, comment) => set((state) => ({
                tasks: state.tasks.map(task => task.id === taskId ? {
                    ...task,
                    comments: [...(task.comments || []), { ...comment, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
                } : task)
            })),
            addTimeEntry: (taskId, entry) => set((state) => ({
                tasks: state.tasks.map(task => task.id === taskId ? {
                    ...task,
                    timeEntries: [...(task.timeEntries || []), { ...entry, id: crypto.randomUUID() }]
                } : task)
            })),
            addRelationship: (taskId, relationship) => set((state) => ({
                tasks: state.tasks.map(task => task.id === taskId ? {
                    ...task,
                    relationships: [...(task.relationships || []), { ...relationship, id: crypto.randomUUID() }]
                } : task)
            })),
            addDoc: (doc) => {
                const id = crypto.randomUUID();
                set((state) => ({
                    docs: [...state.docs, { ...doc, id, updatedAt: new Date().toISOString() }]
                }));
                return id;
            },
            updateDoc: (docId, updates) => set((state) => ({
                docs: state.docs.map(doc => doc.id === docId ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc)
            })),
            addStatus: (targetId, isSpace, status) => set((state) => {
                const id = crypto.randomUUID();
                const newStatus: Status = { ...status, id };
                if (isSpace) {
                    const newSpaces = state.spaces.map(s => s.id === targetId ? { ...s, statuses: [...(s.statuses || []), newStatus] } : s);
                    return { spaces: newSpaces };
                } else {
                    const newLists = state.lists.map(l => l.id === targetId ? { ...l, statuses: [...(l.statuses || []), newStatus] } : l);
                    return { lists: newLists };
                }
            }),
            setTheme: (theme) => set({ theme }),
            setAccentColor: (accentColor) => set({ accentColor }),
        }),
        {
            name: 'ar-generator-app-storage',
        }
    )
);
