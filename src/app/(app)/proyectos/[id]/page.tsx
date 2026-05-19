import ProjectPageClient from "./page-client";

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectPageClient params={params} />;
}
