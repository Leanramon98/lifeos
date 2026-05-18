"use client";

import TurndownService from "turndown";

export function convertToMarkdown(title: string, contentJson: string): string {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  });

  // Since TipTap JSON to HTML is needed first for Turndown...
  // A better way is using a dedicated TipTap to Markdown library,
  // but for simplicity we'll assume we can get the HTML from the editor.
  // However, since we are in a utility, let's keep it simple.
  
  // For now, let's just return a placeholder or a very basic conversion if possible.
  // Actually, Turndown works on HTML. We can get HTML from the editor in the component.
  
  return `# ${title}\n\n${contentJson}`; // This is wrong but placeholder for now
}
