import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center space-x-1 text-sm text-foreground-secondary">
          {breadcrumb.map((item, index) => {
            const isLast = index === breadcrumb.length - 1;
            return (
              <div key={item.label} className="flex items-center">
                {item.href && !isLast ? (
                  <Link href={item.href} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-foreground font-medium" : ""}>
                    {item.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="w-4 h-4 mx-1 opacity-50" />}
              </div>
            );
          })}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-foreground-secondary mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
