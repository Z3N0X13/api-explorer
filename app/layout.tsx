import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Explorer",
  description: "Test et explore tes APIs REST",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
