import NotaPageClient from "./page-client";

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <NotaPageClient params={params} />;
}
