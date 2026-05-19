import WorkspacePageClient from "./page-client";

export function generateStaticParams() {
  return [{ slug: '1' }];
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <WorkspacePageClient params={params} />;
}
