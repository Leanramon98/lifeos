"use client";

import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTasks } from "./useTasks";
import { Task, TaskStatus } from "../types";

export function useTaskDragDrop(tasks: Task[]) {
  const { updateTask, reorderTasks } = useTasks();

  const handleDragEnd = async (event: DragEndEvent, type: 'kanban' | 'calendar') => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (type === 'kanban') {
      const overId = over.id as string;
      
      // Check if dropped over a column (status change)
      if (['backlog', 'todo', 'doing', 'waiting', 'done'].includes(overId)) {
        if (task.status !== overId) {
          await updateTask({ id: taskId, data: { status: overId as TaskStatus } });
        }
      } 
      // Check if dropped over another task (reorder)
      else {
        const overTask = tasks.find(t => t.id === overId);
        if (overTask && active.id !== over.id) {
          // If different status, change status first
          if (task.status !== overTask.status) {
            await updateTask({ id: taskId, data: { status: overTask.status } });
          }
          
          // Reorder logic
          const statusTasks = tasks.filter(t => t.status === overTask.status);
          const oldIndex = statusTasks.findIndex(t => t.id === taskId);
          const newIndex = statusTasks.findIndex(t => t.id === overId);
          
          if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(statusTasks, oldIndex, newIndex);
            await reorderTasks(newOrder.map(t => t.id));
          }
        }
      }
    } else if (type === 'calendar') {
      const overDate = over.id as string; // Expecting ISO date string or 'no-date'
      
      if (overDate === 'no-date') {
        await updateTask({ id: taskId, data: { dueDate: null } });
      } else {
        const newDate = new Date(overDate);
        if (!task.dueDate || new Date(task.dueDate.seconds * 1000).toISOString().split('T')[0] !== overDate) {
          await updateTask({ id: taskId, data: { dueDate: newDate } });
        }
      }
    }
  };

  return { handleDragEnd };
}
