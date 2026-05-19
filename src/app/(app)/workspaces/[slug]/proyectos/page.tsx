import ClientPage from "./page-client";

export function generateStaticParams() {
  return [{ slug: '1' }];
}

export default async function Page({ params }: { params: Promise<any> }) {
  return <ClientPage params={params} />;
}