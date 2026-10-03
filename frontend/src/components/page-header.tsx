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
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase text-primary">{eyebrow}</p> : null}
      <h1 className="max-w-4xl font-serif text-4xl leading-[1.08] sm:text-5xl">{title}</h1>
      {description ? <p className="mt-4 max-w-2xl text-base text-muted-foreground">{description}</p> : null}
    </header>
  );
}
