import ClientPage from "./page-client";

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function Page({ params }: { params: Promise<any> }) {
  return <ClientPage params={params} />;
}