import ProjectLayoutClient from "./layout-client";

export function generateStaticParams() {
  return [{ id: '1' }];
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
