import dynamic from "next/dynamic";

const TareasPageClient = dynamic(() => import("./page-client"), { ssr: false });

export default function Page() {
  return <TareasPageClient />;
}
