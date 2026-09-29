import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ntspire",
  description: "A visual design reference library.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
