export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  name: string;
  status: string;
  priority?: Priority;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  duration: number; // in minutes
  description?: string;
  date: string;
  userId: string;
}

export interface Relationship {
  id: string;
  type: 'waiting' | 'blocking' | 'linked';
  taskId: string;
}

export interface Status {
  id: string;
  name: string;
  color: string;
  type: 'todo' | 'inprogress' | 'done' | 'closed';
}

export interface Doc {
  id: string;
  name: string;
  content: string;
  spaceId?: string;
  userId: string;
  userName: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: Priority;
  spaceId: string;
  listId?: string;
  assignee?: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  subtasks?: Subtask[];
  comments?: Comment[];
  timeEntries?: TimeEntry[];
  relationships?: Relationship[];
  linkedDocId?: string;
}

export interface Space {
  id: string;
  name: string;
  icon: string;
  color: string | null;
  isDefault: boolean;
  taskCount: number;
  statuses?: Status[];
}

export interface Folder {
  id: string;
  name: string;
  spaceId: string;
}

export interface List {
  id: string;
  name: string;
  spaceId: string;
  folderId?: string;
  taskCount: number;
  icon?: string;
  color?: string;
  statuses?: Status[];
}

export type ViewType = 'home' | 'list' | 'kanban' | 'calendar' | 'gantt' | 'timesheet' | 'dashboards' | 'docs' | 'pulse' | 'forms' | 'inbox' | 'teams' | 'whiteboards' | 'clips' | 'goals' | 'space_overview';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColumnSetting {
  id: string;
  name: string;
  visible: boolean;
  width?: number;
}

export interface AppState {
  tasks: Task[];
  spaces: Space[];
  folders: Folder[];
  lists: List[];
  tags: Tag[];
  docs: Doc[];
  currentSpaceId: string;
  currentListId: string | null;
  currentView: ViewType;
  columnSettings: Record<string, ColumnSetting[]>; // keyed by spaceId or listId
  theme: ThemeMode;
  accentColor: string;
  activeTimer: { taskId: string; startTime: string } | null;
}
