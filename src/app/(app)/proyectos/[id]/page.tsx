import dynamic from "next/dynamic";

const ProjectPageClient = dynamic(() => import("./page-client"), { ssr: false });

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectPageClient params={params} />;
}
