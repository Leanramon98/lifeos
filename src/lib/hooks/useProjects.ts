import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onSnapshot, query, where, orderBy, QueryConstraint } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { Project, ProjectFormData, ProjectStatus, AreaSlug } from '../types';
import { 
  getProjectsRef, 
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  archiveProject as apiArchiveProject,
  deleteProject as apiDeleteProject,
  reorderProjects as apiReorderProjects,
  getProjectById
} from '../firebase/projects';
import { useWorkspaces } from './useWorkspaces';

export interface UseProjectsOptions {
  workspaceId?: string;
  areaSlug?: AreaSlug;
  status?: ProjectStatus | ProjectStatus[];
  includeArchived?: boolean;
}

// Mocked state for testing when emulator is down
let mockProjects: Project[] = [
  {
    id: "mock-proj-1",
    workspaceId: "mock-ws-personal",
    workspaceName: "Personal",
    workspaceColor: "#ec4899",
    workspaceSlug: "personal",
    areaSlug: "personal",
    name: "Proyecto LifeOS 🚀",
    description: "Mi nuevo sistema operativo personal.",
    status: "active",
    startDate: new Date() as any,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) as any,
    progressPct: 50,
    taskCounts: { total: 2, done: 1, active: 1 },
    tags: ["Avanzado", "Desarrollo"],
    order: 1,
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  },
  {
    id: "mock-proj-2",
    workspaceId: "mock-ws-trabajo",
    workspaceName: "Trabajo",
    workspaceColor: "#3b82f6",
    workspaceSlug: "trabajo",
    areaSlug: "trabajo",
    name: "Campaña de Marketing 📈",
    description: "Lanzamiento y optimización de ads de la empresa.",
    status: "active",
    startDate: new Date() as any,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) as any,
    progressPct: 0,
    taskCounts: { total: 1, done: 0, active: 1 },
    tags: ["Marketing", "Mensual"],
    order: 2,
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  }
];

export const useProjects = (options: UseProjectsOptions = {}) => {
  const { user } = useAuth();
  const { workspaces } = useWorkspaces();
  const queryClient = useQueryClient();
  const isMockUser = user?.uid === 'mock-user-123';

  // TanStack Query for data caching and mock usage
  const { data: projectsState = [], isLoading: isQueryLoading, error: queryError } = useQuery({
    queryKey: ['projects', user?.uid, options],
    queryFn: async () => {
      if (!user?.uid) return [];
      
      if (isMockUser) {
        let filtered = [...mockProjects];
        if (options.workspaceId) {
          filtered = filtered.filter(p => p.workspaceId === options.workspaceId);
        }
        if (options.areaSlug) {
          filtered = filtered.filter(p => p.areaSlug === options.areaSlug);
        }
        if (options.status) {
          if (Array.isArray(options.status)) {
            filtered = filtered.filter(p => options.status!.includes(p.status));
          } else {
            filtered = filtered.filter(p => p.status === options.status);
          }
        }
        if (!options.includeArchived) {
          filtered = filtered.filter(p => p.status !== 'archived');
        }
        return filtered.sort((a,b) => a.order - b.order);
      }
      return []; // Real data handled by snapshot
    },
    enabled: !!user?.uid,
    staleTime: isMockUser ? 0 : Infinity,
  });

  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(true);
  const [snapshotError, setSnapshotError] = useState<Error | null>(null);

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
    if (options.areaSlug) {
      constraints.push(where("areaSlug", "==", options.areaSlug));
    }
    if (options.status) {
      if (Array.isArray(options.status)) {
        constraints.push(where("status", "in", options.status));
      } else {
        constraints.push(where("status", "==", options.status));
      }
    }
    
    // orderBy order (requires composite index if where constraints are used)
    constraints.push(orderBy('order', 'asc'));

    const q = query(getProjectsRef(user.uid), ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      if (!options.includeArchived && !options.status) {
        data = data.filter(p => p.status !== 'archived');
      }
      queryClient.setQueryData(['projects', user.uid, options], data);
      setIsLoadingSnapshot(false);
      setSnapshotError(null);
    }, (err) => {
      console.error("Firestore onSnapshot error:", err);
      setSnapshotError(err);
      setIsLoadingSnapshot(false);
      // toast.error('Error al sincronizar proyectos'); // might be noisy
    });

    return () => unsubscribe();
  }, [user?.uid, queryClient, isMockUser, JSON.stringify(options)]);

  const isLoading = isMockUser ? isQueryLoading : isLoadingSnapshot;
  const error = isMockUser ? queryError : snapshotError;

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      if (isMockUser) {
        const workspace = workspaces.find(w => w.id === data.workspaceId);
        if (!workspace) throw new Error("Workspace no encontrado");

        const newP: Project = {
          id: `mock-proj-${Date.now()}`,
          workspaceId: data.workspaceId,
          workspaceName: workspace.name,
          workspaceColor: workspace.color,
          workspaceSlug: workspace.slug,
          areaSlug: workspace.areaSlug,
          name: data.name,
          description: data.description || '',
          status: data.status,
          startDate: data.startDate as any || null,
          dueDate: data.dueDate as any || null,
          progressPct: 0,
          taskCounts: { total: 0, done: 0, active: 0 },
          tags: data.tags || [],
          order: mockProjects.filter(p => p.workspaceId === data.workspaceId).length + 1,
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
        };
        mockProjects.push(newP);
        queryClient.invalidateQueries({ queryKey: ['projects', user?.uid] });
        return newP;
      }
      return apiCreateProject(user!.uid, data);
    },
    onSuccess: () => {
      if (!isMockUser) queryClient.invalidateQueries({ queryKey: ['projects', user?.uid] });
      toast.success('Proyecto creado');
    },
    onError: () => toast.error('Error al crear proyecto')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Project> }) => {
      if (isMockUser) {
        if (data.workspaceId) {
           const workspace = workspaces.find(w => w.id === data.workspaceId);
           if (workspace) {
             data.workspaceName = workspace.name;
             data.workspaceColor = workspace.color;
             data.workspaceSlug = workspace.slug;
             data.areaSlug = workspace.areaSlug;
           }
        }
        mockProjects = mockProjects.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date() as any } : p);
        queryClient.invalidateQueries({ queryKey: ['projects', user?.uid] });
        // Also invalidate individual project query
        queryClient.invalidateQueries({ queryKey: ['project', user?.uid, id] });
        return;
      }
      return apiUpdateProject(user!.uid, id, data);
    },
    onSuccess: (_, { id }) => {
      if (!isMockUser) {
        queryClient.invalidateQueries({ queryKey: ['projects', user?.uid] });
        queryClient.invalidateQueries({ queryKey: ['project', user?.uid, id] });
      }
      toast.success('Proyecto actualizado');
    },
    onError: () => toast.error('Error al actualizar proyecto')
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isMockUser) {
        mockProjects = mockProjects.map(p => p.id === id ? { ...p, status: 'archived' } : p);
        queryClient.invalidateQueries({ queryKey: ['projects', user?.uid] });
        return;
      }
      return apiArchiveProject(user!.uid, id);
    },
    onSuccess: () => {
      if (!isMockUser) queryClient.invalidateQueries({ queryKey: ['projects', user?.uid] });
      toast.success('Proyecto archivado');
    },
    onError: () => toast.error('Error al archivar proyecto')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isMockUser) {
        mockProjects = mockProjects.filter(p => p.id !== id);
        queryClient.invalidateQueries({ queryKey: ['projects', user?.uid] });
        return;
      }
      return apiDeleteProject(user!.uid, id);
    },
    onSuccess: () => {
      if (!isMockUser) queryClient.invalidateQueries({ queryKey: ['projects', user?.uid] });
      toast.success('Proyecto eliminado');
    },
    onError: () => toast.error('Error al eliminar proyecto')
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ workspaceId, orderedIds }: { workspaceId: string, orderedIds: string[] }) => {
      if (isMockUser) {
        const newMock = [...mockProjects];
        newMock.forEach(p => {
          if (p.workspaceId === workspaceId) {
            const idx = orderedIds.indexOf(p.id);
            if (idx !== -1) p.order = idx;
          }
        });
        mockProjects = newMock;
        queryClient.invalidateQueries({ queryKey: ['projects', user?.uid] });
        return;
      }
      return apiReorderProjects(user!.uid, workspaceId, orderedIds);
    },
    onError: () => toast.error('Error al reordenar proyectos')
  });

  return {
    projects: projectsState,
    isLoading,
    error,
    createProject: createMutation.mutateAsync,
    updateProject: updateMutation.mutateAsync,
    archiveProject: archiveMutation.mutateAsync,
    deleteProject: deleteMutation.mutateAsync,
    reorderProjects: reorderMutation.mutateAsync,
  };
};

export const useProject = (projectId: string) => {
  const { user } = useAuth();
  const isMockUser = user?.uid === 'mock-user-123';
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['project', user?.uid, projectId],
    queryFn: async () => {
      if (!user) return null;
      if (isMockUser) {
        return mockProjects.find(p => p.id === projectId) || null;
      }
      return getProjectById(user.uid, projectId);
    },
    enabled: !!user?.uid && !!projectId,
  });

  return { project: data, isLoading, error };
};
