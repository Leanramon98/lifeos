import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { Area } from '../types';
import { getAreas, updateAreaName as apiUpdateAreaName } from '../firebase/areas';

// Mocked default areas for testing
const MOCK_AREAS: Area[] = [
  { id: 'trabajo', slug: 'trabajo', name: 'Trabajo', icon: 'Briefcase', order: 1 },
  { id: 'freelance', slug: 'freelance', name: 'Freelance', icon: 'Handshake', order: 2 },
  { id: 'emprendimientos', slug: 'emprendimientos', name: 'Emprendimientos', icon: 'Rocket', order: 3 },
  { id: 'personal', slug: 'personal', name: 'Personal', icon: 'User', order: 4 },
];

export const useAreas = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMockUser = user?.uid === 'mock-user-123';

  const { data: areas = [], isLoading, error } = useQuery({
    queryKey: ['areas', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      if (isMockUser) return MOCK_AREAS;
      return getAreas(user.uid);
    },
    enabled: !!user?.uid,
  });

  const updateAreaName = useMutation({
    mutationFn: async ({ areaId, newName }: { areaId: string, newName: string }) => {
      if (isMockUser) return; // Fake success
      return apiUpdateAreaName(user!.uid, areaId, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', user?.uid] });
      toast.success('Área actualizada');
    },
    onError: () => toast.error('Error al actualizar el área')
  });

  return {
    areas,
    isLoading,
    error,
    updateAreaName: updateAreaName.mutateAsync,
  };
};
