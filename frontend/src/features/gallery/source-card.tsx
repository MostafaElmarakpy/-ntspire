"use client";

import Image from "next/image";
import type { SourceCardData } from "./types";

export function SourceCard({ card }: { card: SourceCardData }) {
  return (
    <article id={`card-${card.id}`} className="overflow-hidden rounded-md border border-border bg-card">
      <Image
        src={card.image.src}
        alt={card.image.alt}
        width={card.image.width}
        height={card.image.height}
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1439px) 33vw, 25vw"
        className="h-auto w-full"
      />
      <div className="space-y-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{card.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{card.industry}</p>
        </div>
        <p className="text-sm text-muted-foreground">{card.description}</p>
        <p className="text-xs text-muted-foreground">{card.pageCount} {card.pageCountLabel}</p>
      </div>
    </article>
  );
}
