"use client";

import React, { useState, useMemo } from "react";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  defaultDropAnimationSideEffects 
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { Task, TaskStatus } from "@/lib/types";
import { BoardColumn } from "./BoardColumn";
import { BoardTaskCard } from "./BoardTaskCard";
import { statusConfig } from "./TaskStatusIcon";
import { useTaskDragDrop } from "@/lib/hooks/useTaskDragDrop";
import { QuickAddTaskDialog } from "./QuickAddTaskDialog";

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  workspaceId?: string;
  projectId?: string;
}

const COLUMNS: TaskStatus[] = ['backlog', 'todo', 'doing', 'waiting', 'done'];

export function TasksBoardView({ tasks, onTaskClick, workspaceId, projectId }: Props) {
  const { handleDragEnd } = useTaskDragDrop(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddStatus, setQuickAddStatus] = useState<TaskStatus>('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const groupedTasks = useMemo(() => {
    return COLUMNS.reduce((acc, status) => {
      acc[status] = tasks.filter(t => t.status === status);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  const handleDragStart = (event: any) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleAddTask = (status: TaskStatus) => {
    setQuickAddStatus(status);
    setQuickAddOpen(true);
  };

  return (
    <div className="flex-1 overflow-x-auto pb-4 -mx-4 md:-mx-8 px-4 md:px-8">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={(e) => {
          handleDragEnd(e, 'kanban');
          setActiveTask(null);
        }}
      >
        <div className="flex gap-4 h-full min-h-[500px]">
          {COLUMNS.map(status => (
            <BoardColumn
              key={status}
              id={status}
              title={statusConfig[status].label}
              tasks={groupedTasks[status]}
              onTaskClick={onTaskClick}
              onAddTask={handleAddTask}
              showWorkspace={!workspaceId}
              showProject={!projectId}
            />
          ))}
        </div>

        {typeof document !== 'undefined' && createPortal(
          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}>
            {activeTask ? (
              <div className="w-[300px]">
                <BoardTaskCard task={activeTask} onClick={() => {}} showWorkspace={!workspaceId} showProject={!projectId} />
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      <QuickAddTaskDialog 
        open={quickAddOpen} 
        onOpenChange={setQuickAddOpen} 
        defaults={{
          status: quickAddStatus,
          workspaceId,
          projectId
        }}
      />
    </div>
  );
}
