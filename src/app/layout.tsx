import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NLP Study Assistant",
  description: "AI-powered flashcards and practice tests from your lecture notes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
