import Link from "next/link";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

export interface Crumb {
  label: string;
  /** The last crumb has no href: it is the page you are on. */
  href?: string;
}

/**
 * The one breadcrumb every detail route renders, so Source ⇄ Page ⇄ Section
 * always reads the same way and the last crumb is the current page.
 *
 * The separator is a sibling of the item, not a child of it: it renders as its
 * own `<li>`, and a list item inside a list item is invalid HTML that would
 * break hydration.
 */
export function DetailBreadcrumbs({ locale, trail }: { locale: SupportedLocale; trail: Crumb[] }) {
  return (
    <Breadcrumb aria-label={t(locale, "detail.breadcrumbLabel")}>
      <BreadcrumbList>
        {trail.map((crumb, index) => (
          <Fragment key={`${crumb.label}-${index}`}>
            {index > 0 ? <BreadcrumbSeparator /> : null}
            <BreadcrumbItem>
              {crumb.href
                ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )
                : <BreadcrumbPage>{crumb.label}</BreadcrumbPage>}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
