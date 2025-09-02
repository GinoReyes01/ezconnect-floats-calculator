import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EZConnect Floats Calculator",
  description: "Quickly size EZConnect floats for HDPE or steel pipe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
