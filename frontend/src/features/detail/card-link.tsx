"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface CardLinkProps {
  href: string;
  /** The link's accessible name; the card's own content stays as its description. */
  label: string;
  children: ReactNode;
}

/**
 * Makes a whole card a link on the index routes.
 *
 * `SectionCard` owns its own Open control, but `PageCard` and `SourceCard` are
 * deliberately presentation-only: Phase 4 built them without a destination so
 * that nothing would guess a route. Wrapping rather than rewriting them keeps
 * those cards exactly as they are and leaves their behaviour available to the
 * Phase 07b work that revisits them.
 */
export function CardLink({ href, label, children }: CardLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="block rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {children}
    </Link>
  );
}
