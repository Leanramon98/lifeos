import dynamic from "next/dynamic";

const WorkspacePageClient = dynamic(() => import("./page-client"), { ssr: false });

export function generateStaticParams() {
  return [{ slug: '1' }];
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <WorkspacePageClient params={params} />;
}
