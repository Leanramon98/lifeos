"use client";

import { safeJsonParse } from "./safe-json";

export function extractMentionsFromContent(contentJson: string): string[] {
  try {
    const content = safeJsonParse(contentJson);
    if (!content) return [];
    
    const mentions: string[] = [];
      
    const traverse = (node: any) => {
      if (node.type === 'mention') {
        mentions.push(node.attrs.id);
      }
      if (node.content) {
        node.content.forEach(traverse);
      }
    };
    
    traverse(content);
    return Array.from(new Set(mentions));
  } catch (e) {
    return [];
  }
}
