"use client";

import React, { useState, useMemo } from "react";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors,
  useDroppable
} from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, Plus, PanelRightClose, PanelRightOpen } from "lucide-react";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfMonth, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { useHotkeys } from "react-hotkeys-hook";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  getMonthDays, 
  getWeekDays, 
  isSameDay, 
  isToday, 
  isInCurrentMonth, 
  formatMonthYear, 
  formatWeekRange, 
  formatFullDay 
} from "@/lib/utils/dates";
import { QuickAddTaskDialog } from "./QuickAddTaskDialog";
import { useTaskDragDrop } from "@/lib/hooks/useTaskDragDrop";

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  workspaceId?: string;
  projectId?: string;
}

type CalendarMode = 'month' | 'week' | 'day';

export function TasksCalendarView({ tasks, onTaskClick, workspaceId, projectId }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<Date | undefined>(undefined);

  const { handleDragEnd } = useTaskDragDrop(tasks);

  const navigate = (dir: 'prev' | 'next') => {
    if (mode === 'month') setCurrentDate(prev => dir === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    else if (mode === 'week') setCurrentDate(prev => dir === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
    else setCurrentDate(prev => dir === 'prev' ? subDays(prev, 1) : addDays(prev, 1));
  };

  useHotkeys('h', (e) => { e.preventDefault(); setCurrentDate(new Date()); });
  useHotkeys('left', (e) => { e.preventDefault(); navigate('prev'); });
  useHotkeys('right', (e) => { e.preventDefault(); navigate('next'); });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (t.dueDate) {
        const day = new Date(t.dueDate.seconds * 1000).toISOString().split('T')[0];
        if (!map[day]) map[day] = [];
        map[day].push(t);
      }
    });
    return map;
  }, [tasks]);

  const tasksWithoutDate = useMemo(() => tasks.filter(t => !t.dueDate && t.status !== 'done'), [tasks]);

  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate]);
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setMode('day');
  };

  const openQuickAdd = (date: Date) => {
    setQuickAddDate(date);
    setQuickAddOpen(true);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={(e) => handleDragEnd(e, 'calendar')}>
      <div className="flex-1 flex overflow-hidden -mx-4 md:-mx-8 border-t border-border">
        {/* Main Calendar Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Calendar Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border bg-surface/50">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-foreground min-w-[160px]">
                {mode === 'month' && formatMonthYear(currentDate)}
                {mode === 'week' && formatWeekRange(currentDate)}
                {mode === 'day' && format(currentDate, "d 'de' MMMM", { locale: es })}
              </h2>
              <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-md border border-border">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate('prev')}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px] font-bold uppercase tracking-wider" onClick={() => setCurrentDate(new Date())}>Hoy</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate('next')}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-surface-elevated p-1 rounded-md border border-border">
                {(['month', 'week', 'day'] as CalendarMode[]).map((m) => (
                  <Button 
                    key={m} 
                    variant={mode === m ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-7 px-3 text-[11px] font-bold uppercase tracking-wider capitalize"
                    onClick={() => setMode(m)}
                  >
                    {m === 'month' ? 'Mes' : m === 'week' ? 'Semana' : 'Día'}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground-tertiary" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {mode === 'month' && (
              <div className="grid grid-cols-7 h-full min-h-[600px]">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                  <div key={d} className="p-2 text-center text-[10px] font-bold text-foreground-tertiary uppercase tracking-widest border-b border-r border-border bg-surface/30">
                    {d}
                  </div>
                ))}
                {monthDays.map((day) => (
                  <CalendarDayCell 
                    key={day.toISOString()} 
                    date={day} 
                    isCurrentMonth={isInCurrentMonth(day, currentDate)}
                    tasks={tasksByDay[day.toISOString().split('T')[0]] || []}
                    onDayClick={handleDayClick}
                    onTaskClick={onTaskClick}
                    onQuickAdd={openQuickAdd}
                  />
                ))}
              </div>
            )}

            {mode === 'week' && (
              <div className="grid grid-cols-7 h-full min-h-[600px]">
                {weekDays.map((day) => (
                  <CalendarWeekColumn 
                    key={day.toISOString()} 
                    date={day} 
                    tasks={tasksByDay[day.toISOString().split('T')[0]] || []}
                    onTaskClick={onTaskClick}
                    onQuickAdd={openQuickAdd}
                  />
                ))}
              </div>
            )}

            {mode === 'day' && (
              <div className="max-w-4xl mx-auto p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground capitalize">{format(currentDate, "EEEE", { locale: es })}</h1>
                    <p className="text-foreground-secondary">{format(currentDate, "d 'de' MMMM, yyyy", { locale: es })}</p>
                  </div>
                  <Button onClick={() => openQuickAdd(currentDate)}><Plus className="w-4 h-4 mr-2" /> Nueva tarea</Button>
                </div>
                <div className="space-y-4">
                  {tasksByDay[currentDate.toISOString().split('T')[0]]?.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className="bg-surface border border-border p-4 rounded-xl shadow-sm hover:shadow-md hover:border-foreground-tertiary transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: task.workspaceColor }} />
                        <span className="text-lg font-medium text-foreground">{task.title}</span>
                      </div>
                    </div>
                  )) || (
                    <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl">
                      <p className="text-foreground-tertiary mb-4">No hay tareas programadas para hoy</p>
                      <Button variant="outline" onClick={() => openQuickAdd(currentDate)}>Agendar tarea</Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Tareas sin fecha */}
        {isSidebarOpen && (
          <CalendarSidebar 
            tasks={tasksWithoutDate} 
            onTaskClick={onTaskClick} 
          />
        )}
      </div>

      <QuickAddTaskDialog 
        open={quickAddOpen} 
        onOpenChange={setQuickAddOpen} 
        defaults={{ 
          dueDate: quickAddDate,
          workspaceId,
          projectId
        }} 
      />
    </DndContext>
  );
}

// Sub-components

function CalendarDayCell({ date, isCurrentMonth, tasks, onDayClick, onTaskClick, onQuickAdd }: any) {
  const dayId = date.toISOString().split('T')[0];
  const { setNodeRef, isOver } = useDroppable({ id: dayId });
  const today = isToday(date);

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "group flex flex-col min-h-[120px] p-2 border-b border-r border-border transition-colors",
        !isCurrentMonth && "bg-surface-elevated/20 opacity-50",
        isOver && "bg-primary/5",
        today && "bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={() => onDayClick(date)}
          className={cn(
            "w-7 h-7 flex items-center justify-center text-[11px] font-bold rounded-full transition-colors",
            today ? "bg-primary text-white" : "text-foreground-secondary hover:bg-surface-elevated"
          )}
        >
          {format(date, 'd')}
        </button>
        <button 
          onClick={() => onQuickAdd(date)}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-surface-elevated rounded transition-all"
        >
          <Plus className="w-3 h-3 text-foreground-tertiary" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
        {tasks.slice(0, 3).map((task: Task) => (
          <CalendarTaskPill key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {tasks.length > 3 && (
          <button className="text-[10px] font-bold text-foreground-tertiary hover:text-foreground pl-1 text-left">
            + {tasks.length - 3} más
          </button>
        )}
      </div>
    </div>
  );
}

function CalendarWeekColumn({ date, tasks, onTaskClick, onQuickAdd }: any) {
  const dayId = date.toISOString().split('T')[0];
  const { setNodeRef, isOver } = useDroppable({ id: dayId });
  const today = isToday(date);

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-h-[500px] border-r border-border transition-colors",
        isOver && "bg-primary/5",
        today && "bg-surface/50"
      )}
    >
      <div className="flex flex-col items-center p-4 border-b border-border bg-surface/30 sticky top-0 z-10">
        <span className="text-[10px] font-bold text-foreground-tertiary uppercase tracking-widest mb-1">{format(date, 'EEE', { locale: es })}</span>
        <span className={cn(
          "w-8 h-8 flex items-center justify-center text-sm font-bold rounded-full",
          today ? "bg-primary text-white" : "text-foreground"
        )}>
          {format(date, 'd')}
        </span>
      </div>
      <div className="flex-1 p-2 space-y-2">
        {tasks.map((task: Task) => (
          <div 
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="p-2 bg-surface border border-border rounded-lg shadow-sm hover:shadow-md hover:border-foreground-tertiary transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.workspaceColor }} />
              <span className="text-[11px] font-semibold text-foreground line-clamp-2 leading-tight">{task.title}</span>
            </div>
            {task.projectName && (
              <span className="text-[9px] text-foreground-tertiary font-medium">{task.projectName}</span>
            )}
          </div>
        ))}
        <button 
          onClick={() => onQuickAdd(date)}
          className="w-full py-2 flex items-center justify-center border border-dashed border-border rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-surface-elevated transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function CalendarTaskPill({ task, onClick }: { task: Task, onClick: () => void }) {
  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="px-1.5 py-0.5 rounded border border-border flex items-center gap-1.5 cursor-pointer hover:shadow-sm transition-shadow overflow-hidden group"
      style={{ backgroundColor: `${task.workspaceColor}15`, borderColor: `${task.workspaceColor}40` }}
    >
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: task.workspaceColor }} />
      <span className="text-[10px] font-medium text-foreground truncate group-hover:text-primary transition-colors">{task.title}</span>
    </div>
  );
}

function CalendarSidebar({ tasks, onTaskClick }: { tasks: Task[], onTaskClick: (task: Task) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'no-date' });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "w-72 border-l border-border bg-surface/30 flex flex-col transition-colors",
        isOver && "bg-primary/5"
      )}
    >
      <div className="p-4 border-b border-border bg-surface/50">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Sin fecha</h3>
        <p className="text-[10px] text-foreground-tertiary">Arrastrá al calendario para asignar</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tasks.map(task => (
          <div 
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="p-3 bg-surface border border-border rounded-lg shadow-sm hover:shadow-md cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.workspaceColor }} />
              <p className="text-[11px] font-medium text-foreground leading-snug line-clamp-2">{task.title}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-foreground-tertiary font-bold uppercase tracking-tight">{task.workspaceName}</span>
              {task.priority !== 'medium' && (
                <span className={cn("text-[9px] font-bold uppercase", task.priority === 'urgent' ? 'text-danger' : 'text-warning')}>
                  {task.priority}
                </span>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-[11px] text-foreground-tertiary text-center py-8">No hay tareas pendientes sin fecha</p>
        )}
      </div>
    </div>
  );
}
