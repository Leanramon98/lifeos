"use client";

import { NoteTemplate } from "../types";

export function getTemplate(type: NoteTemplate): { title: string; content: any } {
  const now = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  switch (type) {
    case 'meeting':
      return {
        title: `Reunión: [Tema] - ${new Date().toLocaleDateString('es-ES')}`,
        content: {
          type: 'doc',
          content: [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Asistentes' }] },
            { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Agenda' }] },
            { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Notas' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Acciones pendientes' }] },
            { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
          ]
        }
      };
    case 'daily':
      return {
        title: `Daily ${now}`,
        content: {
          type: 'doc',
          content: [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Top 3 Tareas' }] },
            { type: 'taskList', content: [
              { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] },
              { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] },
              { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] },
            ] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Notas del día' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Aprendizajes' }] },
            { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
          ]
        }
      };
    case 'idea':
      return {
        title: 'Nueva Idea: [Título]',
        content: {
          type: 'doc',
          content: [
            { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'La Idea' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Descripción breve de la idea...' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '¿Por qué?' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Problema que resuelve o valor que aporta.' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '¿Cómo?' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Posible implementación o pasos iniciales.' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Próximos pasos' }] },
            { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
          ]
        }
      };
    case 'blank':
    default:
      return {
        title: '',
        content: { type: 'doc', content: [{ type: 'paragraph' }] }
      };
  }
}
