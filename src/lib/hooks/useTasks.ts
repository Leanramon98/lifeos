import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onSnapshot, query, where, orderBy, QueryConstraint } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { Task, TaskFormData, TaskStatus, TaskPriority, AreaSlug } from '../types';
import { 
  getTasksRef, 
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  completeTask as apiCompleteTask,
  uncompleteTask as apiUncompleteTask,
  bulkUpdateTasks as apiBulkUpdateTasks,
  bulkDeleteTasks as apiBulkDeleteTasks,
  reorderTasks as apiReorderTasks,
} from '../firebase/tasks';

export interface UseTasksOptions {
  workspaceId?: string;
  projectId?: string | null;
  areaSlug?: AreaSlug;
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  tags?: string[];
  searchQuery?: string;
  includeArchived?: boolean;
}

// Mocked state for testing when emulator is down
let mockTasks: Task[] = [
  {
    id: "mock-task-1",
    projectId: "mock-proj-1",
    projectName: "Proyecto LifeOS 🚀",
    workspaceId: "mock-ws-personal",
    workspaceName: "Personal",
    workspaceColor: "#ec4899",
    workspaceSlug: "personal",
    areaSlug: "personal",
    title: "Diseñar dashboard de LifeOS",
    description: "Crear una maqueta premium del dashboard global de LifeOS, con widgets interactivos.",
    status: "doing",
    priority: "high",
    dueDate: { seconds: Math.floor((Date.now() + 2 * 24 * 60 * 60 * 1000) / 1000), nanoseconds: 0 } as any,
    completedAt: null,
    tags: ["UI", "Diseño"],
    subtaskCounts: { total: 0, done: 0 },
    hasAttachments: false,
    order: 1,
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
  },
  {
    id: "mock-task-2",
    projectId: "mock-proj-1",
    projectName: "Proyecto LifeOS 🚀",
    workspaceId: "mock-ws-personal",
    workspaceName: "Personal",
    workspaceColor: "#ec4899",
    workspaceSlug: "personal",
    areaSlug: "personal",
    title: "Configurar editor TipTap",
    description: "Instalar y configurar el editor rich-text con soporte para tags y menciones.",
    status: "done",
    priority: "urgent",
    dueDate: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    completedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    tags: ["Editor", "Configuración"],
    subtaskCounts: { total: 0, done: 0 },
    hasAttachments: false,
    order: 2,
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
  },
  {
    id: "mock-task-3",
    projectId: "mock-proj-2",
    projectName: "Campaña de Marketing 📈",
    workspaceId: "mock-ws-trabajo",
    workspaceName: "Trabajo",
    workspaceColor: "#3b82f6",
    workspaceSlug: "trabajo",
    areaSlug: "trabajo",
    title: "Crear creativos para ads",
    description: "Diseñar 3 piezas gráficas para los anuncios semanales de la campaña de marketing.",
    status: "todo",
    priority: "medium",
    dueDate: { seconds: Math.floor((Date.now() + 5 * 24 * 60 * 60 * 1000) / 1000), nanoseconds: 0 } as any,
    completedAt: null,
    tags: ["Anuncios", "Creativos"],
    subtaskCounts: { total: 0, done: 0 },
    hasAttachments: false,
    order: 1,
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
  }
];

export const useTasks = (options: UseTasksOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMockUser = user?.uid === 'mock-user-123';

  // TanStack Query for data caching and mock usage
  const { data: tasksState = [], isLoading: isQueryLoading } = useQuery({
    queryKey: ['tasks', user?.uid, options.workspaceId, options.projectId],
    queryFn: async () => {
      if (!user?.uid) return [];
      if (isMockUser) {
        let filtered = [...mockTasks];
        if (options.workspaceId) filtered = filtered.filter(t => t.workspaceId === options.workspaceId);
        if (options.projectId !== undefined) filtered = filtered.filter(t => t.projectId === options.projectId);
        return filtered.sort((a, b) => a.order - b.order);
      }
      return []; // Real data handled by snapshot
    },
    enabled: !!user?.uid,
    staleTime: isMockUser ? 0 : Infinity,
  });

  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(true);

  useEffect(() => {
    if (!user?.uid || isMockUser) {
      setIsLoadingSnapshot(false);
      return;
    }

    setIsLoadingSnapshot(true);
    const constraints: QueryConstraint[] = [];
    
    if (options.workspaceId) {
      constraints.push(where("workspaceId", "==", options.workspaceId));
    }
    if (options.projectId !== undefined) {
      constraints.push(where("projectId", "==", options.projectId));
    }
    
    constraints.push(orderBy('order', 'asc'));

    const q = query(getTasksRef(user.uid), ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      queryClient.setQueryData(['tasks', user.uid, options.workspaceId, options.projectId], data);
      setIsLoadingSnapshot(false);
    }, (err) => {
      console.error("Firestore onSnapshot error:", err);
      setIsLoadingSnapshot(false);
    });

    return () => unsubscribe();
  }, [user?.uid, queryClient, isMockUser, options.workspaceId, options.projectId]);

  // Client-side filtering
  const filteredTasks = useMemo(() => {
    let result = tasksState;

    if (options.status) {
      const statuses = Array.isArray(options.status) ? options.status : [options.status];
      result = result.filter(t => statuses.includes(t.status));
    }

    if (options.priority) {
      const priorities = Array.isArray(options.priority) ? options.priority : [options.priority];
      result = result.filter(t => priorities.includes(t.priority));
    }

    if (options.areaSlug) {
      result = result.filter(t => t.areaSlug === options.areaSlug);
    }

    if (options.tags && options.tags.length > 0) {
      result = result.filter(t => options.tags!.every(tag => t.tags.includes(tag)));
    }

    if (options.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tasksState, options]);

  const isLoading = isMockUser ? isQueryLoading : isLoadingSnapshot;

  const createMutation = useMutation({
    mutationFn: (data: TaskFormData) => {
      if (isMockUser) {
        // Find workspace details in cache
        const workspaces = queryClient.getQueryData<any[]>(['workspaces', user?.uid]) || [];
        const ws = workspaces.find(w => w.id === data.workspaceId);
        
        // Find project details in cache (if any)
        let projectName = null;
        if (data.projectId) {
          const projects = queryClient.getQueryData<any[]>(['projects', user?.uid]) || [];
          const proj = projects.find(p => p.id === data.projectId);
          if (proj) {
            projectName = proj.name;
          }
        }

        const newTask: Task = {
          id: `mock-task-${Date.now()}`,
          ...data,
          projectId: data.projectId || null,
          projectName,
          workspaceId: data.workspaceId,
          workspaceName: ws ? ws.name : 'Mock Workspace',
          workspaceColor: ws ? ws.color : '#4f46e5',
          workspaceSlug: ws ? ws.slug : 'mock',
          areaSlug: ws ? ws.areaSlug : 'trabajo',
          description: data.description || '',
          status: data.status || 'todo',
          priority: data.priority || 'medium',
          dueDate: data.dueDate ? { seconds: Math.floor(data.dueDate.getTime() / 1000), nanoseconds: 0 } as any : null,
          completedAt: null,
          tags: data.tags || [],
          subtaskCounts: { total: 0, done: 0 },
          hasAttachments: false,
          order: mockTasks.length + 1,
          createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
          updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
        };
        mockTasks.push(newTask);
        queryClient.invalidateQueries({ queryKey: ['tasks', user?.uid] });
        return Promise.resolve(newTask);
      }
      return apiCreateTask(user!.uid, data);
    },
    onSuccess: () => {
      toast.success('Tarea creada');
      if (!isMockUser) queryClient.invalidateQueries({ queryKey: ['tasks', user?.uid] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Task> }) => {
      if (isMockUser) {
        mockTasks = mockTasks.map(t => t.id === id ? { ...t, ...data } : t);
        queryClient.invalidateQueries({ queryKey: ['tasks', user?.uid] });
        queryClient.invalidateQueries({ queryKey: ['task', user?.uid, id] });
        return Promise.resolve();
      }
      return apiUpdateTask(user!.uid, id, data);
    },
    onSuccess: () => {
      if (!isMockUser) queryClient.invalidateQueries({ queryKey: ['tasks', user?.uid] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => {
      if (isMockUser) {
        mockTasks = mockTasks.map(t => t.id === id ? { ...t, status: 'done' as const } : t);
        queryClient.invalidateQueries({ queryKey: ['tasks', user?.uid] });
        return Promise.resolve();
      }
      return apiCompleteTask(user!.uid, id);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (isMockUser) {
        mockTasks = mockTasks.filter(t => t.id !== id);
        queryClient.invalidateQueries({ queryKey: ['tasks', user?.uid] });
        return Promise.resolve();
      }
      return apiDeleteTask(user!.uid, id);
    },
    onSuccess: () => toast.success('Tarea eliminada')
  });

  const reorderMutation = useMutation({
    mutationFn: ({ taskIds }: { taskIds: string[] }) => {
      if (isMockUser) {
        // Mock reorder logic
        return Promise.resolve();
      }
      return apiReorderTasks(user!.uid, taskIds);
    }
  });

  return {
    tasks: filteredTasks,
    allTasks: tasksState,
    isLoading,
    createTask: createMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    completeTask: completeMutation.mutateAsync,
    uncompleteTask: (id: string) => updateMutation.mutateAsync({ id, data: { status: 'todo' } }),
    deleteTask: deleteMutation.mutateAsync,
    reorderTasks: reorderMutation.mutateAsync,
  };
};
