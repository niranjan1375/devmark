import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "DevMark - Bookmark Manager for Developers",
  description: "Production-grade bookmark manager with mandatory notes and tags",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#0d1117]">
      <body className="h-full antialiased font-sans text-[#c9d1d9] bg-[#0d1117]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
