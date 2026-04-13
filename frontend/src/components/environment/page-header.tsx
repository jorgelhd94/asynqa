import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[--color-divider] px-4 py-2">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-[--color-text-primary]">{title}</h1>
        {description && (
          <span className="text-[10px] text-[--color-text-muted]">
            {description}
          </span>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
