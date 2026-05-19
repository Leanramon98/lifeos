import dynamic from "next/dynamic";

const NotaPageClient = dynamic(() => import("./page-client"), { ssr: false });

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <NotaPageClient params={params} />;
}
