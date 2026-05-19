"use client";

import React, { useEffect, useMemo } from "react";
import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Mention from "@tiptap/extension-mention";
import { common, createLowlight } from "lowlight";
import tippy from "tippy.js";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Link as LinkIcon, 
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Plus,
  Minus,
  ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SlashCommand } from "./SlashCommand";
import { CommandList } from "./CommandList";
import { useNotes } from "@/lib/hooks/useNotes";
import { safeJsonParse } from "@/lib/utils/safe-json";


const lowlight = createLowlight(common);

interface Props {
  content: string;
  onChange: (content: string, text: string, wordCount: number) => void;
  editable?: boolean;
}

export function NoteEditor({ content, onChange, editable = true }: Props) {
  const { notes, pinnedNotes } = useNotes();
  const allNotes = useMemo(() => [...pinnedNotes, ...notes], [notes, pinnedNotes]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      Underline,
      Highlight,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline cursor-pointer" } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") return "Sin título";
          return "Empezá a escribir o '/' para comandos...";
        },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg border border-border my-4" } }),
      Typography,
      CharacterCount,
      SlashCommand.configure({
        suggestion: {
          items: ({ query }: { query: string }) => {
            return [
              { title: "Heading 1", subtitle: "Título grande", icon: <Heading1 className="w-4 h-4" />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run() },
              { title: "Heading 2", subtitle: "Título mediano", icon: <Heading2 className="w-4 h-4" />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run() },
              { title: "Heading 3", subtitle: "Título pequeño", icon: <Heading3 className="w-4 h-4" />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run() },
              { title: "Bullet List", subtitle: "Lista de puntos", icon: <List className="w-4 h-4" />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
              { title: "Numbered List", subtitle: "Lista numerada", icon: <ListOrdered className="w-4 h-4" />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
              { title: "Task List", subtitle: "Lista de tareas", icon: <CheckSquare className="w-4 h-4" />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleTaskList().run() },
              { title: "Quote", subtitle: "Cita textual", icon: <Quote className="w-4 h-4" />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
              { title: "Code Block", subtitle: "Bloque de código", icon: <Code className="w-4 h-4" />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run() },
              { title: "Divider", subtitle: "Línea horizontal", icon: <Minus className="w-4 h-4" />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setHorizontalRule().run() },
            ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
          },
          render: () => {
            let component: any;
            let popup: any;
            return {
              onStart: (props: any) => {
                component = new ReactRenderer(CommandList, { props, editor: props.editor });
                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              },
              onUpdate(props: any) {
                component.updateProps(props);
                popup[0].setProps({ getReferenceClientRect: props.clientRect });
              },
              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  popup[0].hide();
                  return true;
                }
                return component.ref?.onKeyDown(props);
              },
              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: {
          char: "[[",
          items: ({ query }: { query: string }) => {
            return allNotes
              .filter(n => (n.title || '').toLowerCase().includes(query.toLowerCase()))
              .slice(0, 5)
              .map(n => ({ id: n.id, label: n.title || 'Nota sin título' }));
          },
          render: () => {
            let component: any;
            let popup: any;
            return {
              onStart: (props: any) => {
                component = new ReactRenderer(CommandList, { 
                  props: { ...props, items: props.items.map((i: any) => ({ title: i.label, subtitle: "Nota", icon: <LinkIcon className="w-4 h-4" /> })) }, 
                  editor: props.editor 
                });
                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              },
              onUpdate(props: any) {
                component.updateProps({ ...props, items: props.items.map((i: any) => ({ title: i.label, subtitle: "Nota", icon: <LinkIcon className="w-4 h-4" /> })) });
                popup[0].setProps({ getReferenceClientRect: props.clientRect });
              },
              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  popup[0].hide();
                  return true;
                }
                return component.ref?.onKeyDown(props);
              },
              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
    ],
    content: safeJsonParse(content, ""),
    editable,
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON());
      const text = editor.getText();
      const words = editor.storage.characterCount.words();
      onChange(json, text, words);
    },
  });

  useEffect(() => {
    if (!editor || !content) return;
    
    // Solo actualizamos si el contenido es realmente diferente Y el editor no tiene el foco
    // (para evitar saltos en el cursor mientras el usuario escribe)
    const currentJson = JSON.stringify(editor.getJSON());
    if (content !== currentJson && !editor.isFocused) {
      const parsed = safeJsonParse(content);
      if (parsed) {
        editor.commands.setContent(parsed, false);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="relative w-full">
      {editor && editable && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-surface-elevated border border-border shadow-xl rounded-lg p-1 overflow-hidden">
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", editor.isActive("bold") && "bg-surface-hover")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", editor.isActive("italic") && "bg-surface-hover")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", editor.isActive("underline") && "bg-surface-hover")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></Button>
          <div className="w-px h-4 bg-border mx-1 self-center" />
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", editor.isActive("heading", { level: 1 }) && "bg-surface-hover")} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", editor.isActive("heading", { level: 2 }) && "bg-surface-hover")} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Button>
          <div className="w-px h-4 bg-border mx-1 self-center" />
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", editor.isActive("bulletList") && "bg-surface-hover")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", editor.isActive("taskList") && "bg-surface-hover")} onClick={() => editor.chain().focus().toggleTaskList().run()}><CheckSquare className="h-4 w-4" /></Button>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className="prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[500px]" />
    </div>
  );
}
