import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  className?: string;
}

export function PageHeader({ title, description, eyebrow, className }: PageHeaderProps) {
  return (
    <header className={cn("border-b border-border pb-7", className)}>
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.02em] text-muted-foreground">{eyebrow}</p> : null}
      <h1 className="max-w-4xl text-[26px] font-medium leading-[1.2] tracking-[-0.01em] text-foreground sm:text-[28px]">{title}</h1>
      {description ? <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p> : null}
    </header>
  );
}
