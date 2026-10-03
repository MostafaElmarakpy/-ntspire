"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title: string;
  description: string;
  retryLabel: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <section className="flex min-h-56 flex-col items-center justify-center border border-destructive/40 bg-card px-6 py-10 text-center" role="alert">
      <AlertTriangle className="mb-4 size-7 text-destructive" aria-hidden="true" />
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <Button className="mt-5 min-h-11" onClick={onRetry ?? (() => window.location.reload())}>{retryLabel}</Button>
    </section>
  );
}
