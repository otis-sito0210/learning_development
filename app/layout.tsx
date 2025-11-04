import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "n8n Researcher Forms",
  description: "Create AI-powered conversational forms for research",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
