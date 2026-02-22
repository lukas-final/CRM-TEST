import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sales CRM",
  description: "Sales CRM Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
