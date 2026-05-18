import { 
  format, 
  isToday as isTodayFns, 
  isTomorrow, 
  isYesterday, 
  isPast, 
  addDays, 
  startOfToday, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay as isSameDayFns,
  isSameMonth
} from 'date-fns';
import { es } from 'date-fns/locale';

export type DueUrgency = 'overdue' | 'today' | 'soon' | 'future' | 'none';

export const isToday = isTodayFns;
export const isSameDay = isSameDayFns;

export const formatRelativeDate = (date: Date | null): string => {
  if (!date) return 'Sin fecha';
  
  if (isToday(date)) return 'Hoy';
  if (isTomorrow(date)) return 'Mañana';
  if (isYesterday(date)) return 'Ayer';
  
  if (date.getFullYear() === new Date().getFullYear()) {
    return format(date, "d 'de' MMM", { locale: es });
  }
  
  return format(date, "d 'de' MMM yyyy", { locale: es });
};

export const formatShortDate = (date: Date | null): string => {
  if (!date) return '';
  return format(date, "dd/MM/yyyy", { locale: es });
};

export const getDueDateUrgency = (date: Date | null): DueUrgency => {
  if (!date) return 'none';
  
  const today = startOfToday();
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);

  if (isPast(dueDate) && !isToday(dueDate)) return 'overdue';
  if (isToday(dueDate)) return 'today';
  if (dueDate <= addDays(today, 3)) return 'soon';
  
  return 'future';
};

export const getDueDateColor = (urgency: DueUrgency): string => {
  switch (urgency) {
    case 'overdue': return 'text-danger bg-danger/10 border-danger/20';
    case 'today': return 'text-warning bg-warning/10 border-warning/20';
    case 'soon': return 'text-primary bg-primary/10 border-primary/20';
    case 'future': return 'text-foreground-secondary bg-surface-elevated border-border';
    default: return 'text-foreground-tertiary';
  }
};

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const isInCurrentMonth = (date: Date, referenceMonth: Date): boolean => {
  return isSameMonth(date, referenceMonth);
};

export const formatMonthYear = (date: Date): string => {
  return format(date, "MMMM yyyy", { locale: es });
};

export const formatWeekRange = (date: Date): string => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  
  if (isSameMonth(start, end)) {
    return `${format(start, 'd')} - ${format(end, 'd')} ${format(end, 'MMMM yyyy', { locale: es })}`;
  }
  return `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy', { locale: es })}`;
};

export const formatFullDay = (date: Date): string => {
  return format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
};
