"use client";

import { safeJsonParse } from "./safe-json";

export interface OutlineItem {
  id: string;
  text: string;
  level: number;
}

export function extractOutline(contentJson: string): OutlineItem[] {
  try {
    const content = safeJsonParse(contentJson);
    if (!content) return [];
    
    const outline: OutlineItem[] = [];
      
    const traverse = (node: any) => {
      if (node.type === 'heading') {
        const text = node.content?.map((c: any) => c.text).join('') || 'Sin título';
        outline.push({
          id: text.toLowerCase().replace(/\s+/g, '-'), // Simplified ID
          text,
          level: node.attrs.level
        });
      }
      if (node.content) {
        node.content.forEach(traverse);
      }
    };
    
    traverse(content);
    return outline;
  } catch (e) {
    return [];
  }
}
