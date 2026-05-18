"use client";

export function safeJsonParse(json: string | null | undefined, fallback: any = null): any {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error("JSON parse error:", e, "for content:", json);
    return fallback;
  }
}
