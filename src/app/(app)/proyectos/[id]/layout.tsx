import ProjectLayoutClient from "./layout-client";

export function generateStaticParams() {
  return [];
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  return <ProjectLayoutClient params={params}>{children}</ProjectLayoutClient>;
}
