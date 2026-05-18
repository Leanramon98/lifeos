import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { Task, Subtask, TaskUpdate, TaskActivity, TaskAttachment } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useEffect, useState } from 'react';
import { 
  updateTask as apiUpdateTask, 
  deleteTask as apiDeleteTask,
  completeTask as apiCompleteTask,
  uncompleteTask as apiUncompleteTask
} from '../firebase/tasks';
import { 
  getSubtasksByTask, 
  createSubtask as apiCreateSubtask, 
  toggleSubtask as apiToggleSubtask,
  deleteSubtask as apiDeleteSubtask,
  reorderSubtasks as apiReorderSubtasks
} from '../firebase/subtasks';
import { 
  getUpdatesByTask, 
  createUpdate as apiCreateUpdate,
  deleteUpdate as apiDeleteUpdate
} from '../firebase/task-updates';
import { getActivityByTask } from '../firebase/task-activity';
import { 
  getAttachmentsByTask, 
  uploadAttachment as apiUploadAttachment,
  deleteAttachment as apiDeleteAttachment 
} from '../firebase/task-attachments';
import { toast } from 'sonner';

export const useTask = (taskId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMockUser = user?.uid === 'mock-user-123';

  // Real-time task data
  const [task, setTask] = useState<Task | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(true);

  useEffect(() => {
    if (!user?.uid || !taskId || isMockUser) {
      setIsLoadingTask(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, `users/${user.uid}/tasks`, taskId), (doc) => {
      if (doc.exists()) {
        setTask({ id: doc.id, ...doc.data() } as Task);
      }
      setIsLoadingTask(false);
    });

    return () => unsubscribe();
  }, [user?.uid, taskId, isMockUser]);

  // Sub-resources queries
  const { data: subtasks = [], isLoading: isLoadingSubtasks } = useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: () => getSubtasksByTask(user!.uid, taskId),
    enabled: !!user?.uid && !!taskId && !isMockUser,
  });

  const { data: updates = [], isLoading: isLoadingUpdates } = useQuery({
    queryKey: ['updates', taskId],
    queryFn: () => getUpdatesByTask(user!.uid, taskId),
    enabled: !!user?.uid && !!taskId && !isMockUser,
  });

  const { data: activity = [], isLoading: isLoadingActivity } = useQuery({
    queryKey: ['activity', taskId],
    queryFn: () => getActivityByTask(user!.uid, taskId),
    enabled: !!user?.uid && !!taskId && !isMockUser,
  });

  const { data: attachments = [], isLoading: isLoadingAttachments } = useQuery({
    queryKey: ['attachments', taskId],
    queryFn: () => getAttachmentsByTask(user!.uid, taskId),
    enabled: !!user?.uid && !!taskId && !isMockUser,
  });

  // Mutations
  const updateTaskMutation = useMutation({
    mutationFn: (data: Partial<Task>) => apiUpdateTask(user!.uid, taskId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', user?.uid] })
  });

  const createSubtaskMutation = useMutation({
    mutationFn: (title: string) => apiCreateSubtask(user!.uid, taskId, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] })
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: (subtaskId: string) => apiToggleSubtask(user!.uid, taskId, subtaskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] })
  });

  const createUpdateMutation = useMutation({
    mutationFn: (content: string) => apiCreateUpdate(user!.uid, taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['updates', taskId] });
      queryClient.invalidateQueries({ queryKey: ['activity', taskId] });
    }
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: (file: File) => apiUploadAttachment(user!.uid, taskId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['activity', taskId] });
      toast.success('Archivo subido');
    }
  });

  return {
    task: isMockUser ? null : task,
    subtasks,
    updates,
    activity,
    attachments,
    isLoading: isLoadingTask || isLoadingSubtasks || isLoadingUpdates || isLoadingActivity || isLoadingAttachments,
    
    updateTask: updateTaskMutation.mutateAsync,
    createSubtask: createSubtaskMutation.mutateAsync,
    toggleSubtask: toggleSubtaskMutation.mutateAsync,
    deleteSubtask: (subtaskId: string) => apiDeleteSubtask(user!.uid, taskId, subtaskId).then(() => queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] })),
    
    createUpdate: createUpdateMutation.mutateAsync,
    deleteUpdate: (updateId: string) => apiDeleteUpdate(user!.uid, taskId, updateId).then(() => queryClient.invalidateQueries({ queryKey: ['updates', taskId] })),
    
    uploadAttachment: uploadAttachmentMutation.mutateAsync,
    deleteAttachment: (attachmentId: string) => apiDeleteAttachment(user!.uid, taskId, attachmentId).then(() => queryClient.invalidateQueries({ queryKey: ['attachments', taskId] })),
  };
};
