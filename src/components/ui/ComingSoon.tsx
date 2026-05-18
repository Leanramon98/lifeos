import { Construction } from "lucide-react";
import { PageHeader } from "../layout/PageHeader";

interface ComingSoonProps {
  block: number;
  title: string;
}

export function ComingSoon({ block, title }: ComingSoonProps) {
  return (
    <div className="h-full flex flex-col">
      <PageHeader title={title} />
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-xl bg-surface-elevated/30">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Construction className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Próximamente
        </h3>
        <p className="text-foreground-secondary max-w-sm">
          Esta sección se implementará en el <strong>Bloque {block}</strong> del desarrollo de LESO Life OS.
        </p>
      </div>
    </div>
  );
}
