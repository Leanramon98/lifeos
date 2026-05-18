import { Timestamp } from 'firebase/firestore';

export type AreaSlug = 'trabajo' | 'freelance' | 'emprendimientos' | 'personal';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  settings: {
    theme: 'light' | 'dark' | 'system';
    density: 'comfortable' | 'compact';
    language: 'es' | 'en';
    timezone: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Area {
  id: string;
  slug: AreaSlug;
  name: string;
  icon: string;
  order: number;
}

export interface Workspace {
  id: string;
  areaId: string;
  areaSlug: AreaSlug;
  name: string;
  slug: string;          // generado a partir del nombre (kebab-case)
  color: string;         // hex
  icon: string;          // nombre de icono Lucide
  description: string;
  isActive: boolean;
  isArchived: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WorkspaceFormData {
  name: string;
  areaSlug: AreaSlug;
  color: string;
  icon: string;
  description?: string;
}

export type ProjectStatus = 'active' | 'paused' | 'done' | 'archived';

export interface Project {
  id: string;
  workspaceId: string;
  workspaceName: string;     // denormalizado
  workspaceColor: string;    // denormalizado
  workspaceSlug: string;     // denormalizado
  areaSlug: AreaSlug;        // denormalizado para queries de "todos los proyectos de Trabajo"
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Timestamp | null;
  dueDate: Timestamp | null;
  progressPct: number;       // 0-100, calculado
  taskCounts: {
    total: number;
    done: number;
    active: number;
  };
  tags: string[];
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProjectFormData {
  name: string;
  workspaceId: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date | null;
  dueDate?: Date | null;
  tags?: string[];
}

export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'waiting' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  projectId: string | null;
  projectName: string | null;        // denormalizado
  workspaceId: string;
  workspaceName: string;             // denormalizado
  workspaceColor: string;            // denormalizado
  workspaceSlug: string;             // denormalizado
  areaSlug: AreaSlug;                // denormalizado para queries
  title: string;
  description: string;               // markdown
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Timestamp | null;
  completedAt: Timestamp | null;
  tags: string[];
  subtaskCounts: {
    total: number;
    done: number;
  };
  hasAttachments: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TaskFormData {
  title: string;
  workspaceId: string;
  projectId?: string | null;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
  tags?: string[];
}

export interface TaskUpdate {
  id: string;
  content: string;                   // markdown
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Subtask {
  id: string;
  title: string;
  isDone: boolean;
  order: number;
}

export type ActivityType =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'due_date_changed'
  | 'project_changed'
  | 'workspace_changed'
  | 'completed'
  | 'uncompleted'
  | 'archived'
  | 'subtask_added'
  | 'subtask_completed'
  | 'update_added'
  | 'attachment_added';

export interface TaskActivity {
  id: string;
  type: ActivityType;
  meta: Record<string, any>;         // datos específicos por tipo (oldValue, newValue, etc.)
  createdAt: Timestamp;
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  downloadUrl: string;
  createdAt: Timestamp;
}
export interface Note {
  id: string;
  workspaceId: string | null;          // null = nota personal sin workspace
  workspaceName: string | null;        // denormalizado
  workspaceColor: string | null;       // denormalizado
  workspaceSlug: string | null;        // denormalizado
  projectId: string | null;
  projectName: string | null;          // denormalizado
  title: string;
  content: string;                     // JSON serializado de TipTap
  contentText: string;                 // texto plano para search (auto-generado del JSON)
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  wordCount: number;
  readingTime: number;                 // en minutos, calculado
  createdAt: any;                      // Firestore Timestamp
  updatedAt: any;                      // Firestore Timestamp
  mentions?: string[];                 // IDs de notas mencionadas
}

export interface NoteFormData {
  title?: string;
  workspaceId?: string | null;
  projectId?: string | null;
  content?: string;                    // JSON TipTap
  tags?: string[];
  template?: NoteTemplate;             // si viene, pre-rellena el content
}

export type NoteTemplate =
  | 'blank'
  | 'meeting'
  | 'idea'
  | 'journal'
  | 'daily'
  | 'weekly_review'
  | 'project_brief'
  | 'todo';
