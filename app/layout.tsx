import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auth App",
  description: "Next.js Authentication with Role-Based Access Control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background antialiased font-sans">
        {children}
      </body>
    </html>
  );
};