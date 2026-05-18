import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { Workspace, WorkspaceFormData } from '../types';
import { 
  getWorkspacesRef, 
  createWorkspace as apiCreateWorkspace,
  updateWorkspace as apiUpdateWorkspace,
  archiveWorkspace as apiArchiveWorkspace,
  unarchiveWorkspace as apiUnarchiveWorkspace,
  deleteWorkspace as apiDeleteWorkspace,
  reorderWorkspaces as apiReorderWorkspaces,
  getWorkspaceBySlug
} from '../firebase/workspaces';

// Mocked state for testing when emulator is down
let mockWorkspaces: Workspace[] = [
  {
    id: "mock-ws-personal",
    areaId: "personal",
    areaSlug: "personal",
    name: "Personal",
    slug: "personal",
    color: "#ec4899",
    icon: "User",
    description: "Mi espacio de vida personal, hábitos y proyectos.",
    isActive: true,
    isArchived: false,
    order: 1,
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  },
  {
    id: "mock-ws-trabajo",
    areaId: "trabajo",
    areaSlug: "trabajo",
    name: "Trabajo",
    slug: "trabajo",
    color: "#3b82f6",
    icon: "Briefcase",
    description: "Espacio laboral y tareas profesionales.",
    isActive: true,
    isArchived: false,
    order: 2,
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  }
];

export const useWorkspaces = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMockUser = user?.uid === 'mock-user-123';

  // TanStack Query for data fetching/caching
  const { data: workspacesState = [], isLoading: isQueryLoading, error: queryError } = useQuery({
    queryKey: ['workspaces', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      if (isMockUser) return [...mockWorkspaces];
      // Real fetch if not relying on snapshot, but snapshot handles real data
      const q = query(getWorkspacesRef(user.uid), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
    },
    enabled: !!user?.uid,
    staleTime: isMockUser ? 0 : Infinity, // Always fresh for mock to allow invalidation
  });

  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(true);
  const [snapshotError, setSnapshotError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.uid || isMockUser) {
      setIsLoadingSnapshot(false);
      return;
    }

    setIsLoadingSnapshot(true);
    const q = query(getWorkspacesRef(user.uid), orderBy('order', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
      queryClient.setQueryData(['workspaces', user.uid], data);
      setIsLoadingSnapshot(false);
      setSnapshotError(null);
    }, (err) => {
      console.error("Firestore onSnapshot error:", err);
      setSnapshotError(err);
      setIsLoadingSnapshot(false);
      toast.error('Error al sincronizar workspaces');
    });

    return () => unsubscribe();
  }, [user?.uid, queryClient, isMockUser]);

  const isLoading = isMockUser ? isQueryLoading : isLoadingSnapshot;
  const error = isMockUser ? queryError : snapshotError;

  const activeWorkspaces = workspacesState.filter(w => !w.isArchived);
  const archivedWorkspaces = workspacesState.filter(w => w.isArchived);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: WorkspaceFormData) => {
      if (isMockUser) {
        const newW: Workspace = {
          id: `mock-ws-${Date.now()}`,
          areaId: data.areaSlug,
          areaSlug: data.areaSlug,
          name: data.name,
          slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          color: data.color,
          icon: data.icon,
          description: data.description || '',
          isActive: true,
          isArchived: false,
          order: mockWorkspaces.length + 1,
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
        };
        mockWorkspaces.push(newW);
        queryClient.invalidateQueries({ queryKey: ['workspaces', user?.uid] });
        return newW;
      }
      return apiCreateWorkspace(user!.uid, data);
    },
    onSuccess: () => {
      if (!isMockUser) queryClient.invalidateQueries({ queryKey: ['workspaces', user?.uid] });
      toast.success('Workspace creado');
    },
    onError: () => toast.error('Error al crear workspace')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Workspace> }) => {
      if (isMockUser) {
        mockWorkspaces = mockWorkspaces.map(w => w.id === id ? { ...w, ...data } : w);
        queryClient.invalidateQueries({ queryKey: ['workspaces', user?.uid] });
        return;
      }
      return apiUpdateWorkspace(user!.uid, id, data);
    },
    onSuccess: () => {
      if (!isMockUser) queryClient.invalidateQueries({ queryKey: ['workspaces', user?.uid] });
      toast.success('Workspace actualizado');
    },
    onError: () => toast.error('Error al actualizar workspace')
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isMockUser) {
        mockWorkspaces = mockWorkspaces.map(w => w.id === id ? { ...w, isArchived: true } : w);
        queryClient.invalidateQueries({ queryKey: ['workspaces', user?.uid] });
        return;
      }
      return apiArchiveWorkspace(user!.uid, id);
    },
    onSuccess: () => {
      if (!isMockUser) queryClient.invalidateQueries({ queryKey: ['workspaces', user?.uid] });
      toast.success('Workspace archivado');
    },
    onError: () => toast.error('Error al archivar workspace')
  });
  
  const unarchiveMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isMockUser) {
        mockWorkspaces = mockWorkspaces.map(w => w.id === id ? { ...w, isArchived: false } : w);
        queryClient.invalidateQueries({ queryKey: ['workspaces', user?.uid] });
        return;
      }
      return apiUnarchiveWorkspace(user!.uid, id);
    },
    onSuccess: () => {
      if (!isMockUser) queryClient.invalidateQueries({ queryKey: ['workspaces', user?.uid] });
      toast.success('Workspace desarchivado');
    },
    onError: () => toast.error('Error al desarchivar workspace')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isMockUser) {
        mockWorkspaces = mockWorkspaces.filter(w => w.id !== id);
        queryClient.invalidateQueries({ queryKey: ['workspaces', user?.uid] });
        return;
      }
      return apiDeleteWorkspace(user!.uid, id);
    },
    onSuccess: () => {
      if (!isMockUser) queryClient.invalidateQueries({ queryKey: ['workspaces', user?.uid] });
      toast.success('Workspace eliminado');
    },
    onError: () => toast.error('Error al eliminar workspace')
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      if (isMockUser) {
        // mock logic for reorder
        const newMock = [...mockWorkspaces];
        newMock.forEach(w => {
          const idx = orderedIds.indexOf(w.id);
          if (idx !== -1) w.order = idx;
        });
        newMock.sort((a,b) => a.order - b.order);
        mockWorkspaces = newMock;
        queryClient.invalidateQueries({ queryKey: ['workspaces', user?.uid] });
        return;
      }
      return apiReorderWorkspaces(user!.uid, orderedIds);
    },
    onError: () => toast.error('Error al reordenar workspaces')
  });

  return {
    workspaces: activeWorkspaces,
    archivedWorkspaces,
    isLoading,
    error,
    createWorkspace: createMutation.mutateAsync,
    updateWorkspace: updateMutation.mutateAsync,
    archiveWorkspace: archiveMutation.mutateAsync,
    unarchiveWorkspace: unarchiveMutation.mutateAsync,
    deleteWorkspace: deleteMutation.mutateAsync,
    reorderWorkspaces: reorderMutation.mutateAsync,
  };
};

export const useWorkspace = (slug: string) => {
  const { user } = useAuth();
  const isMockUser = user?.uid === 'mock-user-123';
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['workspace', user?.uid, slug],
    queryFn: async () => {
      if (!user) return null;
      if (isMockUser) {
        return mockWorkspaces.find(w => w.slug === slug) || null;
      }
      return getWorkspaceBySlug(user.uid, slug);
    },
    enabled: !!user?.uid && !!slug,
  });

  return { workspace: data, isLoading, error };
};
