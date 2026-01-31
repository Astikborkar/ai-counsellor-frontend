import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Counsellor",
  description: "Your AI Study Abroad Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
