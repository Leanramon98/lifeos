import WorkspaceLayoutClient from "./layout-client";

export function generateStaticParams() {
  return [];
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  return <WorkspaceLayoutClient params={params}>{children}</WorkspaceLayoutClient>;
}
