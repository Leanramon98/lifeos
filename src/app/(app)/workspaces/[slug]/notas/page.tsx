import dynamic from "next/dynamic";

const ClientPage = dynamic(() => import("./page-client"), { ssr: false });

export function generateStaticParams() {
  return [{ slug: '1' }];
}

export default async function Page({ params }: { params: Promise<any> }) {
  return <ClientPage params={params} />;
}
