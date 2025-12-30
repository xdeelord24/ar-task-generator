import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Task, Space, Folder, List, ViewType, Subtask, Tag, ColumnSetting, Comment, TimeEntry, Relationship, Doc, Status, SavedView, AIConfig, Message, Dashboard, Clip, Notification, NotificationSettings, Agent } from '../types';

interface AppStore extends AppState {
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;
    duplicateTask: (taskId: string) => void;
    archiveTask: (taskId: string) => void;
    addSubtask: (taskId: string, subtask: Omit<Subtask, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
    deleteSubtask: (taskId: string, subtaskId: string) => void;
    setSpaces: (spaces: Space[]) => void;
    addSpace: (space: Omit<Space, 'id' | 'taskCount' | 'isDefault'>) => void;
    setFolders: (folders: Folder[]) => void;
    addFolder: (folder: Omit<Folder, 'id'>) => void;
    updateFolder: (folderId: string, updates: Partial<Folder>) => void;
    deleteFolder: (folderId: string) => void;
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
    removeRelationship: (taskId: string, relationshipId: string) => void;
    addDoc: (doc: Omit<Doc, 'id' | 'updatedAt'>) => string;
    updateDoc: (docId: string, updates: Partial<Doc>) => void;
    addStatus: (targetId: string, isSpace: boolean, status: Omit<Status, 'id'>) => void;
    setTheme: (theme: AppState['theme']) => void;
    setAccentColor: (color: string) => void;
    startTimer: (taskId: string) => void;
    stopTimer: () => void;
    addSavedView: (view: Omit<SavedView, 'id' | 'createdAt'>) => void;
    updateSavedView: (viewId: string, updates: Partial<SavedView>) => void;
    deleteSavedView: (viewId: string) => void;
    setAIConfig: (config: Partial<AIConfig>) => void;
    setAiMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
    clearAiMessages: () => void;
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    startNewChat: () => void;
    loadSession: (sessionId: string) => void;
    deleteSession: (sessionId: string) => void;
    addDashboard: (dashboard: Omit<Dashboard, 'id' | 'updatedAt' | 'createdAt' | 'ownerId' | 'ownerName'> & { id?: string }) => string;
    updateDashboard: (id: string, updates: Partial<Dashboard>) => void;
    deleteDashboard: (id: string) => void;
    setCurrentDashboardId: (id: string | null) => void;
    addClip: (clip: Omit<Clip, 'id' | 'createdAt' | 'ownerId' | 'ownerName'>) => void;
    deleteClip: (id: string) => void;
    addClipComment: (clipId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
    renameClip: (id: string, name: string) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
    markNotificationAsRead: (notificationId: string) => void;
    markAllNotificationsAsRead: () => void;
    clearNotification: (notificationId: string) => void;
    clearAllNotifications: () => void;
    updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
    checkDueDates: () => void;
    addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'creatorId' | 'creatorName'>) => void;
    updateAgent: (id: string, updates: Partial<Agent>) => void;
    deleteAgent: (id: string) => void;
}

export const DEFAULT_STATUSES: Status[] = [
    { id: 'todo', name: 'TO DO', color: '#87909e', type: 'todo' },
    { id: 'inprogress', name: 'IN PROGRESS', color: '#3b82f6', type: 'inprogress' },
    { id: 'completed', name: 'COMPLETED', color: '#10b981', type: 'done' }
];

export const useAppStore = create<AppStore>()(
    persist(
        (set, get) => ({
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
            folders: [],
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
                    { id: 'name', name: 'Name', visible: true, width: 350 },
                    { id: 'assignee', name: 'Assignee', visible: true, width: 140 },
                    { id: 'dueDate', name: 'Due Date', visible: true, width: 130 },
                    { id: 'priority', name: 'Priority', visible: true, width: 110 },
                    { id: 'status', name: 'Status', visible: true, width: 130 },
                ]
            },
            theme: 'system',
            accentColor: '#2563eb',
            activeTimer: null,
            agents: [],
            savedViews: [
                { id: 'default-list', name: 'List', viewType: 'list', isPinned: true, isPrivate: false, createdAt: new Date().toISOString() },
                { id: 'default-kanban', name: 'Board', viewType: 'kanban', isPinned: true, isPrivate: false, createdAt: new Date().toISOString() },
                { id: 'default-calendar', name: 'Calendar', viewType: 'calendar', isPinned: true, isPrivate: false, createdAt: new Date().toISOString() },
                { id: 'default-gantt', name: 'Gantt', viewType: 'gantt', isPinned: true, isPrivate: false, createdAt: new Date().toISOString() },
            ],
            aiConfig: {
                provider: 'gemini',
                ollamaHost: 'http://localhost:11434',
                ollamaModel: 'llama3'
            },
            aiMessages: [],
            aiSessions: [],
            dashboards: [
                {
                    id: 'dash-1',
                    name: 'Project Overview',
                    spaceId: 'team-space',
                    items: [
                        { id: '1', type: 'stat', title: 'Total Tasks', size: 'small', config: { metric: 'total' } },
                        { id: '2', type: 'stat', title: 'Completed', size: 'small', config: { metric: 'completed' } },
                        { id: '3', type: 'stat', title: 'In Progress', size: 'small', config: { metric: 'inprogress' } },
                        { id: '4', type: 'stat', title: 'Urgent', size: 'small', config: { metric: 'urgent' } },
                        { id: '5', type: 'bar', title: 'Task Distribution', size: 'large' },
                        { id: '6', type: 'priority', title: 'Priority Breakdown', size: 'medium' }
                    ],
                    updatedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    ownerId: 'user-1',
                    ownerName: 'Jundee'
                }
            ],
            currentDashboardId: null,
            clips: [
                {
                    id: 'clip-1',
                    name: 'screen-recording-2025-12-30-02:27',
                    duration: '00:06',
                    createdAt: new Date().toISOString(),
                    ownerId: 'user-1',
                    ownerName: 'Jundee Mark Gerona Molina',
                    type: 'video',
                    transcript: 'Welcome to Clips. Capture your device screen with just a few clicks. Record and effortlessly share your videos with anyone.'
                }
            ],
            sidebarCollapsed: false,
            notifications: [],
            notificationSettings: {
                enabled: true,
                dueSoonDays: 3,
                browserNotifications: false,
                soundEnabled: false,
                notifyOnOverdue: true,
                notifyOnDueSoon: true,
                notifyOnAssignment: true
            },

            setTasks: (tasks) => set({ tasks }),
            addTask: (task) => set((state) => {
                const newTask = {
                    ...task,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    subtasks: [],
                    tags: task.tags || []
                };

                // Helper to process agents
                let updatedTasks = [newTask, ...state.tasks];
                const activeAgents = state.agents.filter(a => a.isEnabled && a.trigger.type === 'task_created');

                activeAgents.forEach(agent => {
                    // Check conditions (Enhanced fuzzy match)
                    if (agent.trigger.conditions) {
                        const condition = agent.trigger.conditions.toLowerCase();
                        const taskText = (newTask.name + ' ' + (newTask.description || '')).toLowerCase();

                        // Treat condition as set of keywords if it contains spaces
                        const keywords = condition.split(' ').filter(w => w.length > 3 && !['task', 'about', 'when', 'this', 'that', 'with', 'from'].includes(w));
                        const isMatch = keywords.length > 0
                            ? keywords.some(k => taskText.includes(k))
                            : taskText.includes(condition);

                        if (!isMatch) return;
                    }

                    // Execute Action
                    if (agent.action.type === 'launch_autopilot') {
                        let updates: any = {};
                        const instructions = agent.action.instructions?.toLowerCase() || '';

                        // Simple Instruction Parser
                        if (instructions.includes('high priority')) updates.priority = 'high';
                        if (instructions.includes('urgent')) updates.priority = 'urgent';

                        // Tag parsing
                        if (instructions.includes('tag')) {
                            // extracting tags naive approach
                            const words = instructions.split(' ');
                            const tagIndex = words.indexOf('tag');
                            if (tagIndex !== -1 && words[tagIndex + 1]) {
                                // check for 'tag it as X'
                                const tagCandidates = words.slice(tagIndex + 1).filter(w => !['as', 'it', 'is', 'a', 'the'].includes(w));
                                if (tagCandidates.length > 0) {
                                    const newTag = tagCandidates[0].replace(/[^a-z0-9]/g, ''); // clean tag
                                    if (newTag) updates.tags = [...(newTask.tags || []), newTag];
                                }
                            }
                        }

                        // Apply updates
                        updatedTasks = updatedTasks.map(t => t.id === newTask.id ? {
                            ...t,
                            ...updates,
                            comments: [...(t.comments || []), {
                                id: crypto.randomUUID(),
                                userId: 'agent-bot',
                                userName: 'Autopilot Agent',
                                text: `🤖 **Autopilot Executed**\n\nI have updated this task based on your instructions:\n${updates.priority ? `- Set priority to **${updates.priority}**\n` : ''}${updates.tags ? `- Added tag **${updates.tags[updates.tags.length - 1]}**` : ''}`,
                                createdAt: new Date().toISOString()
                            }]
                        } : t);
                    } else if (agent.action.type === 'send_notification') {
                        // We can't easily call other actions from here without recursion issues in some setups,
                        // so we'll just push to the notification array directly if needed, or use a separate effect.
                        // For simplicity in this demo, we'll assume the notification relies on an external watcher or just skip it for now.
                    }
                });

                return { tasks: updatedTasks };
            }),
            updateTask: (taskId, updates) => set((state) => {
                console.log(`Updating task ${taskId}`, updates);
                let newTasks = state.tasks.map((task) =>
                    task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
                );

                const updatedTask = newTasks.find(t => t.id === taskId);
                if (updatedTask) {
                    const activeAgents = state.agents.filter(a => a.isEnabled && a.trigger.type === 'task_updated');
                    activeAgents.forEach(agent => {
                        // Check conditions
                        if (agent.trigger.conditions) {
                            const condition = agent.trigger.conditions.toLowerCase();
                            const taskText = (updatedTask.name + ' ' + (updatedTask.description || '')).toLowerCase();
                            if (!taskText.includes(condition)) return;
                        }

                        if (agent.action.type === 'launch_autopilot') {
                            // Add comment
                            newTasks = newTasks.map(t => t.id === taskId ? {
                                ...t,
                                comments: [...(t.comments || []), {
                                    id: crypto.randomUUID(),
                                    userId: 'agent-bot',
                                    userName: 'Autopilot Agent',
                                    text: `🤖 **Autopilot Update**\n\nTask detected update. Re-evaluating based on instructions: "${agent.action.instructions}"`,
                                    createdAt: new Date().toISOString()
                                }]
                            } : t);
                        }
                    });
                }

                return { tasks: newTasks };
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
            deleteSubtask: (taskId, subtaskId) => set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === taskId ? {
                        ...task,
                        subtasks: task.subtasks?.filter(st => st.id !== subtaskId)
                    } : task
                )
            })),
            setSpaces: (spaces) => set({ spaces }),
            addSpace: (space) => set((state) => ({
                spaces: [...state.spaces, { ...space, id: crypto.randomUUID(), taskCount: 0, isDefault: false, statuses: DEFAULT_STATUSES }]
            })),
            setFolders: (folders) => set({ folders }),
            addFolder: (folder) => set((state) => ({
                folders: [...state.folders, { ...folder, id: crypto.randomUUID() }]
            })),
            updateFolder: (folderId, updates) => set((state) => ({
                folders: state.folders.map(f => f.id === folderId ? { ...f, ...updates } : f)
            })),
            deleteFolder: (folderId) => set((state) => ({
                folders: state.folders.filter(f => f.id !== folderId),
                lists: state.lists.map(l => l.folderId === folderId ? { ...l, folderId: undefined } : l) // Move lists to root of space
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
                folders: state.folders.filter(f => f.spaceId !== spaceId),
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
            removeRelationship: (taskId, relationshipId) => set((state) => ({
                tasks: state.tasks.map(task => task.id === taskId ? {
                    ...task,
                    relationships: (task.relationships || []).filter(r => r.id !== relationshipId)
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

                const getUpdatedStatuses = (currentStatuses: Status[] | undefined) => {
                    // If no statuses exist (e.g. from old persisted state), use defaults + new one
                    const base = (currentStatuses && currentStatuses.length > 0)
                        ? currentStatuses
                        : DEFAULT_STATUSES;
                    return [...base, newStatus];
                };

                if (isSpace) {
                    const newSpaces = state.spaces.map(s =>
                        s.id === targetId ? { ...s, statuses: getUpdatedStatuses(s.statuses) } : s
                    );
                    return { spaces: newSpaces };
                } else {
                    const newLists = state.lists.map(l =>
                        l.id === targetId ? { ...l, statuses: getUpdatedStatuses(l.statuses) } : l
                    );
                    return { lists: newLists };
                }
            }),
            setTheme: (theme) => set({ theme }),
            setAccentColor: (accentColor) => set({ accentColor }),

            startTimer: (taskId) => {
                const state = get();
                // If there's already a timer running, stop it first
                if (state.activeTimer) {
                    state.stopTimer();
                }
                set({ activeTimer: { taskId, startTime: new Date().toISOString() } });
            },

            stopTimer: () => {
                const state = get();
                const { activeTimer } = state;
                if (!activeTimer) return;

                const endTime = new Date();
                const startTime = new Date(activeTimer.startTime);
                const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

                // Always record at least 1 minute if it ran
                const duration = durationMinutes < 1 ? 1 : durationMinutes;

                state.addTimeEntry(activeTimer.taskId, {
                    duration,
                    date: endTime.toISOString(),
                    userId: 'user-1'
                });

                set({ activeTimer: null });
            },

            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

            addSavedView: (view) => set((state) => ({
                savedViews: [...state.savedViews, { ...view, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
            })),
            updateSavedView: (viewId, updates) => set((state) => ({
                savedViews: state.savedViews.map(v => v.id === viewId ? { ...v, ...updates } : v)
            })),
            deleteSavedView: (viewId) => set((state) => ({
                savedViews: state.savedViews.filter(v => v.id !== viewId)
            })),
            setAIConfig: (config) => set((state) => ({
                aiConfig: { ...state.aiConfig, ...config }
            })),
            setAiMessages: (messages) => set((state) => ({
                aiMessages: typeof messages === 'function' ? messages(state.aiMessages) : messages
            })),
            clearAiMessages: () => set({ aiMessages: [] }),
            startNewChat: () => set((state) => {
                if (state.aiMessages.length === 0) return state;
                const firstUserMsg = state.aiMessages.find(m => m.role === 'user');
                const title = firstUserMsg ? (firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')) : 'New Chat';

                const newSession = {
                    id: crypto.randomUUID(),
                    title,
                    createdAt: new Date().toISOString(),
                    messages: state.aiMessages
                };

                return {
                    aiSessions: [newSession, ...state.aiSessions],
                    aiMessages: []
                };
            }),
            loadSession: (sessionId) => set((state) => {
                const session = state.aiSessions.find(s => s.id === sessionId);
                if (!session) return state;
                return { aiMessages: session.messages };
            }),
            deleteSession: (sessionId) => set((state) => ({
                aiSessions: state.aiSessions.filter(s => s.id !== sessionId)
            })),
            addDashboard: (dashboard) => {
                const id = dashboard.id || crypto.randomUUID();
                set((state) => ({
                    dashboards: [
                        ...state.dashboards,
                        {
                            ...dashboard,
                            id,
                            updatedAt: new Date().toISOString(),
                            createdAt: new Date().toISOString(),
                            ownerId: 'user-1',
                            ownerName: 'Jundee'
                        } as Dashboard
                    ]
                }));
                return id;
            },
            updateDashboard: (id, updates) => set((state) => ({
                dashboards: state.dashboards.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)
            })),
            deleteDashboard: (id) => set((state) => ({
                dashboards: state.dashboards.filter(d => d.id !== id),
                currentDashboardId: state.currentDashboardId === id ? null : state.currentDashboardId
            })),
            setCurrentDashboardId: (id) => set({ currentDashboardId: id }),
            addClip: (clip) => set((state) => ({
                clips: [
                    {
                        ...clip,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        ownerId: 'user-1',
                        ownerName: 'Jundee Mark Gerona Molina'
                    },
                    ...state.clips
                ]
            })),
            deleteClip: (id) => set((state) => {
                console.log('Action: deleteClip', id);
                return {
                    clips: state.clips.filter(c => c.id !== id)
                };
            }),
            addClipComment: (clipId, comment) => set((state) => ({
                clips: state.clips.map(c => c.id === clipId ? {
                    ...c,
                    comments: [...(c.comments || []), { ...comment, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
                } : c)
            })),
            renameClip: (id, name) => set((state) => {
                console.log('Action: renameClip', id, name);
                return {
                    clips: state.clips.map(c => c.id === id ? { ...c, name, updatedAt: new Date().toISOString() } : c)
                };
            }),

            // Notification actions
            addNotification: (notification) => set((state) => ({
                notifications: [
                    {
                        ...notification,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        isRead: false
                    },
                    ...state.notifications
                ]
            })),

            markNotificationAsRead: (notificationId) => set((state) => ({
                notifications: state.notifications.map(n =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            })),

            markAllNotificationsAsRead: () => set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true }))
            })),

            clearNotification: (notificationId) => set((state) => ({
                notifications: state.notifications.filter(n => n.id !== notificationId)
            })),

            clearAllNotifications: () => set({ notifications: [] }),

            updateNotificationSettings: (settings) => set((state) => ({
                notificationSettings: { ...state.notificationSettings, ...settings }
            })),

            checkDueDates: () => {
                const state = get();
                if (!state.notificationSettings.enabled) return;

                const now = new Date();
                const dueSoonThreshold = new Date();
                dueSoonThreshold.setDate(now.getDate() + state.notificationSettings.dueSoonDays);

                state.tasks.forEach(task => {
                    if (!task.dueDate) return;

                    const dueDate = new Date(task.dueDate);
                    const taskId = task.id;

                    // Check if notification already exists for this task
                    const existingNotification = state.notifications.find(
                        n => n.taskId === taskId && (n.type === 'due_soon' || n.type === 'overdue')
                    );

                    // Check for overdue tasks
                    if (state.notificationSettings.notifyOnOverdue && dueDate < now && task.status !== 'COMPLETED') {
                        if (!existingNotification || existingNotification.type !== 'overdue') {
                            state.addNotification({
                                type: 'overdue',
                                title: 'Task Overdue',
                                message: `"${task.name}" is overdue`,
                                taskId: task.id,
                                taskName: task.name,
                                dueDate: task.dueDate
                            });

                            // Browser notification
                            if (state.notificationSettings.browserNotifications && 'Notification' in window) {
                                if (Notification.permission === 'granted') {
                                    new Notification('Task Overdue', {
                                        body: `"${task.name}" is overdue`,
                                        icon: '/favicon.ico'
                                    });
                                }
                            }
                        }
                    }
                    // Check for due soon tasks
                    else if (state.notificationSettings.notifyOnDueSoon && dueDate <= dueSoonThreshold && dueDate >= now && task.status !== 'COMPLETED') {
                        if (!existingNotification) {
                            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                            state.addNotification({
                                type: 'due_soon',
                                title: 'Task Due Soon',
                                message: `"${task.name}" is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
                                taskId: task.id,
                                taskName: task.name,
                                dueDate: task.dueDate
                            });

                            // Browser notification
                            if (state.notificationSettings.browserNotifications && 'Notification' in window) {
                                if (Notification.permission === 'granted') {
                                    new Notification('Task Due Soon', {
                                        body: `"${task.name}" is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
                                        icon: '/favicon.ico'
                                    });
                                }
                            }
                        }
                    }
                });
            },

            addAgent: (agent) => set((state) => ({
                agents: [
                    ...state.agents,
                    {
                        ...agent,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        creatorId: 'user-1',
                        creatorName: 'Jundee'
                    }
                ]
            })),
            updateAgent: (id, updates) => set((state) => ({
                agents: state.agents.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)
            })),
            deleteAgent: (id) => set((state) => ({
                agents: state.agents.filter(a => a.id !== id)
            })),
        }),
        {
            name: 'ar-generator-app-storage',
        }
    )
);
