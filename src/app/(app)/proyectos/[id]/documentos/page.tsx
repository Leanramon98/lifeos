"use client";
import { ComingSoon } from "@/components/ui/ComingSoon";
export default function ProjectDocumentosPage() {
  return <ComingSoon block={5} title="Documentos del proyecto" />;
}

export function generateStaticParams() {
  return [];
}
